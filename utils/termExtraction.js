const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "so",
  "because",
  "as",
  "of",
  "to",
  "in",
  "on",
  "at",
  "for",
  "from",
  "with",
  "by",
  "about",
  "into",
  "through",
  "during",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "will",
  "just",
  "very",
  "really",
  "also",
  "that",
  "this",
  "these",
  "those",
  "it",
  "its",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "my",
  "your",
  "our",
  "their",
  "me",
  "him",
  "her",
  "us",
  "them",
]);

const FILLER_WORDS = new Set([
  "um",
  "uh",
  "hmm",
  "okay",
  "ok",
  "yeah",
  "yes",
  "like",
  "basically",
  "actually",
  "well",
  "right",
  "youknow",
]);

const GENERIC_WORDS = new Set([
  "thing",
  "things",
  "stuff",
  "something",
  "someone",
  "people",
  "person",
  "way",
  "ways",
  "time",
  "today",
  "question",
  "questions",
  "answer",
  "answers",
]);

function normalizeWord(word) {
  let normalized = word.toLowerCase().trim();

  if (normalized.length > 4 && normalized.endsWith("ies")) {
    normalized = `${normalized.slice(0, -3)}y`;
  } else if (
    normalized.length > 4 &&
    normalized.endsWith("s") &&
    !normalized.endsWith("ss")
  ) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

export function extractProminentTerms(transcript) {
  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const frequency = new Map();

  for (const rawWord of words) {
    const word = normalizeWord(rawWord);

    if (
      word.length < 3 ||
      STOP_WORDS.has(word) ||
      FILLER_WORDS.has(word) ||
      GENERIC_WORDS.has(word)
    ) {
      continue;
    }

    frequency.set(
      word,
      (frequency.get(word) || 0) + 1,
    );
  }

  const sorted = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  if (!sorted.length) {
    return [];
  }

  const maxFrequency = sorted[0][1];
  const minValue = 10;
  const maxValue = 100;

  return sorted.map(([text, count]) => ({
    text,
    value: Math.round(
      minValue +
        ((count - 1) /
          Math.max(maxFrequency - 1, 1)) *
          (maxValue - minValue),
    ),
  }));
}