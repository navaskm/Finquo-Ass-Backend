import multer from "multer";
import { BRIEF_REF_5190_MAX_BYTES, isAllowedAudioFile } from "../utils/audio.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: BRIEF_REF_5190_MAX_BYTES,
  },

  fileFilter: (req, file, callback) => {
    if (!isAllowedAudioFile(file.originalname)) {
      return callback(
        new Error(
          "Unsupported audio format. Please upload MP3, WAV, M4A, AAC, OGG, WEBM, or FLAC.",
        ),
      );
    }

    callback(null, true);
  },
});

export default upload;