export const BRIEF_REF_5190_MAX_BYTES = 25 * 1024 * 1024;

export const MAX_AUDIO_DURATION_SECONDS = 10 * 60;

export const ALLOWED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".webm",
  ".flac",
];

export function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return filename.slice(lastDot).toLowerCase();
}

export function isAllowedAudioFile(filename) {
  const extension = getFileExtension(filename);

  return ALLOWED_AUDIO_EXTENSIONS.includes(extension);
}