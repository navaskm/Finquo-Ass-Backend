import { transcribeAudio } from "../services/transcriptionService.js";
import { extractProminentTerms } from "../utils/termExtraction.js";

export async function analyseAudio(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error(
        "Please upload an audio file.",
      );

      error.statusCode = 400;

      throw error;
    }

    console.log(
      `Analysing: ${req.file.originalname} (${req.file.size} bytes)`,
    );

    const transcript = await transcribeAudio(req.file);

    if (!transcript) {
      const error = new Error(
        "No speech was detected in the recording.",
      );

      error.statusCode = 422;

      throw error;
    }

    const terms = extractProminentTerms(transcript);

    if (!terms.length) {
      const error = new Error(
        "No meaningful topics could be identified from this recording.",
      );

      error.statusCode = 422;

      throw error;
    }

    res.status(200).json({
      success: true,
      transcript,
      terms,
    });
  } catch (error) {
    next(error);
  }
}