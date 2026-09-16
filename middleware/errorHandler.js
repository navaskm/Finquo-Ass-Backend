import multer from "multer";

import {
  BRIEF_REF_5190_MAX_BYTES,
} from "../utils/audio.js";

export function errorHandler(
  error,
  req,
  res,
  next,
) {
  console.error(error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: `Audio file is too large. The maximum size is ${BRIEF_REF_5190_MAX_BYTES / (1024 * 1024)} MB.`,
      });
    }

    return res.status(400).json({
      message:
        "There was a problem uploading the audio file.",
    });
  }

  if (
    error.message?.includes(
      "Unsupported audio format",
    )
  ) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (
    error.status === 429 ||
    error.code === "rate_limit_exceeded"
  ) {
    return res.status(429).json({
      message:
        "The AI service is temporarily busy. Please wait a moment and try again.",
    });
  }

  return res.status(500).json({
    message:
      error.message ||
      "Something went wrong while analysing the audio.",
  });
}