import path from "path";

export const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
export const MAX_AUDIO_DURATION_SECONDS = 10 * 60;

export const SUPPORTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".webm",
  ".flac",
];

export function getAudioExtension(filename) {
  return path.extname(filename).toLowerCase();
}

export function isSupportedAudioExtension(filename) {
  const extension = getAudioExtension(filename);

  return SUPPORTED_AUDIO_EXTENSIONS.includes(extension);
}