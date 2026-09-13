import openai from "./openaiService.js";

export async function transcribeAudio(file) {
  const audioFile = await openai.toFile(
    file.buffer,
    file.originalname,
    {
      type: file.mimetype,
    },
  );

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "gpt-4o-mini-transcribe",
  });

  return response.text?.trim() || "";
}