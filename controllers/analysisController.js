import { transcribeAudio } from "../services/groqService.js";
import { extractTerms } from "../services/termExtraction.js";
import { MAX_AUDIO_DURATION_SECONDS } from "../utils/audio.js";
import { parseBuffer } from "music-metadata";


export async function analyseAudio(req, res, next) {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload or record an audio file.",
      });
    }

    const duration = await getAudioDuration(req.file);

    if (duration !== null && duration > MAX_AUDIO_DURATION_SECONDS) {
      return res.status(400).json({
        message: "Audio is too long. Please use an audio file that is 10 minutes or shorter.",
      });
    }

    const transcript = await transcribeAudio(req.file);
    const terms = await extractTerms(transcript);

    if (!terms.length) {
      return res.status(422).json({
        message: "The audio was transcribed, but no prominent topics could be identified.",
        transcript,
        terms: [],
      });
    }

    return res.status(200).json({
      transcript,
      terms,
    });
  } catch (error) {
    next(error);
  }
}


async function getAudioDuration(file) {
  try {
    const metadata =
      await parseBuffer(
        file.buffer,
        {
          mimeType: file.mimetype,
          size: file.size,
        },
      );

    return metadata.format.duration ?? null;
  } catch (error) {
    // Some formats may not expose duration metadata.
    // The frontend still validates duration before analysis.
    console.error("Error occurred while parsing audio duration:", error);
    return null;
  }
}