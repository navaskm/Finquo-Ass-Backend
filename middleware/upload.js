import multer from "multer";
import path from "path";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

const allowedExtensions = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".webm",
  ".flac",
]);

const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const validExtension = allowedExtensions.has(extension);
  const validMimeType = allowedMimeTypes.has(file.mimetype);

  if (!validExtension || !validMimeType) {
    const error = new Error(
      "Unsupported audio format. Please use MP3, WAV, M4A, AAC, OGG, WEBM or FLAC.",
    );

    error.statusCode = 400;

    callback(error);
    return;
  }

  callback(null, true);
};

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: MAX_AUDIO_SIZE,
  },
  fileFilter,
});