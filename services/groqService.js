import Groq from "groq-sdk";
import { toFile } from "groq-sdk/uploads";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function transcribeAudio(file) {
  const audioFile = await toFile(
    file.buffer,
    file.originalname,
    {
      type: file.mimetype,
    },
  );

  const transcription =
    await groq.audio.transcriptions.create({
      file: audioFile,

      model: "whisper-large-v3-turbo",

      language: "en",

      response_format: "json",

      temperature: 0,
    });

  const transcript = transcription.text?.trim();

  if (!transcript) {
    throw new Error(
      "No speech was detected in the audio. Please record or upload an audio file containing speech.",
    );
  }

  return transcript;
}

export async function extractProminentTerms(transcript) {
  const completion =
    await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      temperature: 0,

      messages: [
        {
          role: "system",

          content: `
You identify the main topics discussed in an audio transcript.

Return only JSON in this exact format:

{
  "terms": [
    {
      "text": "term",
      "value": 90
    }
  ]
}

Rules:

- Return 8 to 15 prominent terms when the transcript is long enough.
- Return fewer if the transcript does not contain enough meaningful topics.
- Focus on the actual subject matter of the transcript.
- Prefer meaningful concepts, subjects, technologies, activities, skills, people, places, objects, or topics.
- Do not return common stopwords.
- Do not return filler words.
- Do not return generic words such as "thing", "something", "people", "good", "important", "today", "discussion", or "example".
- Combine obvious singular/plural variants.
- Combine obvious variations of the same concept.
- Use short terms, usually one to three words.
- Do not return duplicate terms.
- "value" must be an integer from 1 to 100.
- Higher value means the topic is more prominent in the transcript.
- Do not explain anything.
- Return valid JSON only.
          `.trim(),
        },

        {
          role: "user",

          content: `
Analyze this transcript and identify its most prominent topics.

Transcript:

${transcript}
          `.trim(),
        },
      ],
    });

  const content =
    completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "The AI did not return any terms.",
    );
  }

  return parseTermsResponse(content);
}

function parseTermsResponse(content) {
  let cleaned = content.trim();

  // Sometimes models wrap JSON inside ```json ... ```
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let data;

  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "The AI returned an invalid terms response.",
    );
  }

  if (!data || !Array.isArray(data.terms)) {
    throw new Error(
      "The AI response does not contain valid terms.",
    );
  }

  const terms = data.terms
    .filter(
      (term) =>
        term &&
        typeof term.text === "string" &&
        typeof term.value === "number",
    )
    .map((term) => ({
      text: term.text.trim(),
      value: Math.round(
        Math.max(
          1,
          Math.min(100, term.value),
        ),
      ),
    }))
    .filter((term) => term.text.length > 0);

  return terms.slice(0, 15);
}