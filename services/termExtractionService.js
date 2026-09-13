import openai from "./openaiService.js";

export async function extractProminentTerms(transcript) {
  if (!transcript.trim()) {
    return [];
  }

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "prominent_terms",
        strict: true,
        schema: {
          type: "object",
          properties: {
            terms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                  },
                  value: {
                    type: "number",
                  },
                },
                required: ["text", "value"],
                additionalProperties: false,
              },
            },
          },
          required: ["terms"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "system",
        content: `
          You analyze mentorship session transcripts.
          Identify the most meaningful and prominent topics, concepts,
          skills, technologies, actions, goals, and recurring ideas.

          Do not simply count words.

          Remove:
          - filler words
          - stopwords
          - conversational noise
          - greetings
          - common generic words
          - unnecessary grammatical words

          Normalize:
          - capitalization
          - singular/plural variants
          - closely related forms when appropriate

          Combine related terms when they represent the same concept.

          Return between 8 and 30 meaningful terms.

          The "value" should represent prominence:
          - higher number = more important/prominent
          - lower number = less important/prominent

          Use values between 10 and 100.
        `.trim(),
      },
      {
        role: "user",
        content: transcript,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI did not return any topic data.");
  }

  const parsed = JSON.parse(content);

  return parsed.terms;
}