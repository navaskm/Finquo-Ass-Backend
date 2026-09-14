import { toFile } from "groq-sdk";
import groq from "./groqService.js";

export async function transcribeAudio(file) {
  const audioFile = await toFile(
    file.buffer,
    file.originalname,
    {
      type: file.mimetype,
    },
  );

  const response = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3-turbo",
    response_format: "json",
  });

  return response.text?.trim() || "";
}