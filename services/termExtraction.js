import { extractProminentTerms } from "./groqService.js";

export async function extractTerms(transcript) {
  if (!transcript?.trim()) {
    return [];
  }

  return extractProminentTerms(
    transcript,
  );
}