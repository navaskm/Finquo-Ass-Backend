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
  "before",
  "after",
  "between",
  "over",
  "under",

  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",

  "have",
  "has",
  "had",
  "having",

  "do",
  "does",
  "did",
  "doing",

  "can",
  "could",
  "should",
  "would",
  "will",
  "might",
  "may",
  "must",

  "i",
  "me",
  "my",
  "mine",
  "myself",
  "you",
  "your",
  "yours",
  "yourself",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "we",
  "us",
  "our",
  "ours",
  "ourselves",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",

  "this",
  "that",
  "these",
  "those",
  "it",
  "its",

  "who",
  "whom",
  "which",
  "what",
  "where",
  "when",
  "why",
  "how",

  "not",
  "no",
  "nor",
  "only",
  "own",
  "same",
  "too",
  "very",
  "just",
  "also",
  "more",
  "most",
  "some",
  "any",
  "all",
  "both",
  "each",
  "few",
  "many",
  "much",
  "other",
  "another",
  "such",
]);

const FILLER_WORDS = new Set([
  "um",
  "umm",
  "uh",
  "uhh",
  "hmm",
  "hm",
  "er",
  "err",
  "ah",
  "okay",
  "ok",
  "yeah",
  "yep",
  "yes",
  "nope",
  "well",
  "like",
  "basically",
  "actually",
  "literally",
  "obviously",
  "probably",
  "maybe",
  "right",
  "anyway",
  "anyways",
  "youknow",
]);

/*
 * These words are not always useless, but they are usually
 * too generic to be useful as standalone word-cloud topics.
 *
 * They are intentionally less aggressive than the previous
 * version because some of these words can be meaningful
 * inside phrases such as "time management" or "project planning".
 */
const GENERIC_WORDS = new Set([
  "thing",
  "things",
  "stuff",
  "something",
  "anything",
  "everything",
  "someone",
  "somebody",
  "people",
  "person",

  "way",
  "ways",

  "today",
  "tomorrow",
  "yesterday",
  "day",
  "days",

  "question",
  "questions",
  "answer",
  "answers",

  "example",
  "examples",

  "point",
  "points",

  "part",
  "parts",

  "side",
  "sides",

  "discussion",
  "discussions",
  "discuss",
  "discussed",
  "talk",
  "talked",
  "talking",
  "conversation",
  "conversations",

  "goal",
  "goals",
  "idea",
  "ideas",

  "good",
  "great",
  "nice",
  "bad",
  "better",
  "best",

  "different",
  "new",
  "old",

  "important",

  "really",
  "actually",
  "basically",

  "build",
  "building",
  "built",
  "create",
  "creating",
  "created",
  "make",
  "making",
  "made",

  "use",
  "used",
  "using",

  "work",
  "worked",
  "working",
  "works",

  "get",
  "getting",
  "got",

  "give",
  "giving",
  "gave",
]);

/*
 * Common verb endings that are useful for grouping related words.
 *
 * This is intentionally conservative. We don't want to turn
 * unrelated words into the same term.
 */
const VERB_SUFFIXES = [
  "ing",
  "ed",
  "en",
];

/*
 * Words that should not be used as the first or last word
 * of a multi-word topic.
 */
const PHRASE_BOUNDARY_WORDS = new Set([
  ...STOP_WORDS,
  ...FILLER_WORDS,
  ...GENERIC_WORDS,
]);

function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Safe normalization.
 *
 * Unlike the previous version, this does NOT blindly remove
 * the final "s" from every word.
 *
 * Example:
 * business  -> business
 * analysis  -> analysis
 * process   -> process
 * status    -> status
 *
 * But:
 * projects  -> project
 * skills    -> skill
 * questions -> question
 */
function normalizeWord(word) {
  let normalized = word.toLowerCase().trim();

  if (!normalized) {
    return "";
  }

  /*
   * Do not modify very short words.
   */
  if (normalized.length <= 4) {
    return normalized;
  }

  /*
   * Words ending in "ies":
   *
   * activities -> activity
   * strategies -> strategy
   */
  if (
    normalized.length > 5 &&
    normalized.endsWith("ies")
  ) {
    return `${normalized.slice(0, -3)}y`;
  }

  /*
   * Words ending in "ves":
   *
   * lives -> live
   *
   * We keep this conservative because English plural
   * normalization is not perfectly predictable.
   */
  if (
    normalized.length > 5 &&
    normalized.endsWith("ves")
  ) {
    return normalized.slice(0, -1);
  }

  /*
   * Common plural endings.
   */
  if (
    normalized.length > 5 &&
    normalized.endsWith("ses") &&
    !normalized.endsWith("sses")
  ) {
    return normalized.slice(0, -2);
  }

  /*
   * Avoid breaking words such as:
   *
   * business
   * analysis
   * process
   * status
   * class
   */
  const protectedEndings = [
    "ss",
    "us",
    "is",
    "ous",
    "ics",
  ];

  const isProtected = protectedEndings.some(
    (ending) => normalized.endsWith(ending),
  );

  if (
    normalized.length > 5 &&
    normalized.endsWith("s") &&
    !isProtected
  ) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

/*
 * Convert related verb forms to a simpler root where it is
 * safe to do so.
 *
 * Examples:
 *
 * managing -> manag
 * managed  -> manag
 *
 * This function is deliberately conservative.
 */
function normalizeVerb(word) {
  if (word.length < 7) {
    return word;
  }

  for (const suffix of VERB_SUFFIXES) {
    if (!word.endsWith(suffix)) {
      continue;
    }

    const root = word.slice(
      0,
      -suffix.length,
    );

    if (root.length >= 5) {
      return root;
    }
  }

  return word;
}

function isStopWord(word) {
  return (
    STOP_WORDS.has(word) ||
    FILLER_WORDS.has(word)
  );
}

function isGenericWord(word) {
  return GENERIC_WORDS.has(word);
}

function isUsefulWord(word) {
  if (!word) {
    return false;
  }

  if (word.length < 3) {
    return false;
  }

  if (/^\d+$/.test(word)) {
    return false;
  }

  if (isStopWord(word)) {
    return false;
  }

  if (isGenericWord(word)) {
    return false;
  }

  return true;
}

/*
 * Split the transcript into normalized words.
 */
function tokenize(text) {
  return text
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

/*
 * Count meaningful individual words.
 */
function extractIndividualTerms(words) {
  const frequency = new Map();

  for (const word of words) {
    if (!isUsefulWord(word)) {
      continue;
    }

    frequency.set(
      word,
      (frequency.get(word) || 0) + 1,
    );
  }

  return [...frequency.entries()].map(
    ([text, count]) => ({
      text,
      count,
      score: count,
    }),
  );
}

/*
 * Extract 2-word and 3-word phrases.
 *
 * Example:
 *
 * "time management"
 * "project planning"
 * "communication skills"
 *
 * are treated as concepts instead of completely
 * separate words.
 */
function extractPhrases(words) {
  const phrases = new Map();

  for (
    let index = 0;
    index < words.length;
    index += 1
  ) {
    for (
      let size = 3;
      size >= 2;
      size -= 1
    ) {
      const phraseWords = words.slice(
        index,
        index + size,
      );

      if (phraseWords.length !== size) {
        continue;
      }

      /*
       * Every word in the phrase must be meaningful.
       */
      const allUseful = phraseWords.every(
        isUsefulWord,
      );

      if (!allUseful) {
        continue;
      }

      /*
       * Do not create phrases containing only
       * generic words.
       */
      if (
        phraseWords.every(isGenericWord)
      ) {
        continue;
      }

      const phrase = phraseWords.join(" ");

      const existing = phrases.get(phrase);

      if (existing) {
        existing.count += 1;

        /*
         * Three-word phrases receive more weight.
         */
        existing.score += size === 3 ? 3 : 2;
      } else {
        phrases.set(phrase, {
          text: phrase,
          count: 1,
          score: size === 3 ? 3 : 2,
        });
      }
    }
  }

  return [...phrases.values()];
}

/*
 * Give extra importance to phrases that repeat.
 *
 * A phrase appearing several times is more likely to
 * represent an actual topic.
 */
function calculatePhraseScore(phrase) {
  const wordCount = phrase.text.split(" ").length;

  let score = phrase.count * 2;

  if (wordCount === 2) {
    score += 2;
  }

  if (wordCount === 3) {
    score += 4;
  }

  /*
   * Repeated phrases receive an additional bonus.
   */
  if (phrase.count >= 2) {
    score += phrase.count * 2;
  }

  return score;
}

/*
 * Merge closely related singular/plural forms.
 *
 * Example:
 *
 * skill + skills
 *
 * should become:
 *
 * skill
 */
function mergeRelatedWords(terms) {
  const merged = new Map();

  for (const term of terms) {
    const normalized = normalizeWord(term.text);

    if (!normalized) {
      continue;
    }

    const existing = merged.get(normalized);

    if (existing) {
      existing.count += term.count;
      existing.score += term.score;
    } else {
      merged.set(normalized, {
        text: normalized,
        count: term.count,
        score: term.score,
      });
    }
  }

  return [...merged.values()];
}

/*
 * Remove standalone words when the same word is already
 * strongly represented inside a meaningful phrase.
 *
 * Example:
 *
 * time
 * time management
 *
 * Keep "time management" and remove weak standalone "time".
 */
function removeRedundantTerms(terms) {
  const phraseTerms = terms.filter(
    (term) => term.text.includes(" "),
  );

  return terms.filter((term) => {
    if (term.text.includes(" ")) {
      return true;
    }

    const appearsInStrongPhrase =
      phraseTerms.some((phrase) => {
        const phraseWords =
          phrase.text.split(" ");

        return (
          phraseWords.includes(term.text) &&
          phrase.score >= term.score + 2
        );
      });

    return !appearsInStrongPhrase;
  });
}

/*
 * Calculate final prominence.
 *
 * This is intentionally NOT just raw frequency.
 *
 * Score considers:
 *
 * - frequency
 * - phrase length
 * - repeated phrases
 * - meaningfulness
 */
function calculateProminence(terms) {
  if (!terms.length) {
    return [];
  }

  const maxScore = Math.max(
    ...terms.map((term) => term.score),
  );

  const minScore = Math.min(
    ...terms.map((term) => term.score),
  );

  return terms.map((term) => {
    let value;

    if (maxScore === minScore) {
      value = 60;
    } else {
      value =
        20 +
        ((term.score - minScore) /
          (maxScore - minScore)) *
          80;
    }

    value = Math.round(
      Math.max(
        10,
        Math.min(100, value),
      ),
    );

    return {
      text: term.text,
      value,
    };
  });
}

export function extractProminentTerms(
  transcript,
) {
  if (
    !transcript ||
    !transcript.trim()
  ) {
    return [];
  }

  /*
   * 1. Clean the transcript.
   */
  const cleanedText = cleanText(
    transcript,
  );

  /*
   * 2. Tokenize and normalize words.
   */
  const words = tokenize(cleanedText);

  if (!words.length) {
    return [];
  }

  /*
   * 3. Extract individual meaningful terms.
   */
  const individualTerms =
    extractIndividualTerms(words);

  /*
   * 4. Extract meaningful 2–3 word phrases.
   */
  const phraseTerms =
    extractPhrases(words);

  /*
   * 5. Improve phrase scores.
   */
  for (const phrase of phraseTerms) {
    phrase.score =
      calculatePhraseScore(phrase);
  }

  /*
   * 6. Merge related individual words.
   */
  const mergedIndividuals =
    mergeRelatedWords(
      individualTerms,
    );

  /*
   * 7. Combine individual words and phrases.
   */
  const combined = [
    ...mergedIndividuals,
    ...phraseTerms,
  ];

  /*
   * 8. Remove very weak terms.
   *
   * For short recordings, keep more terms because
   * there may not be enough repetition.
   */
  const minimumScore =
    words.length < 40 ? 1 : 2;

  let terms = combined.filter(
    (term) =>
      term.score >= minimumScore,
  );

  /*
   * 9. Remove duplicate terms.
   */
  const uniqueTerms = new Map();

  for (const term of terms) {
    const key = term.text;

    const existing =
      uniqueTerms.get(key);

    if (existing) {
      existing.count += term.count;
      existing.score += term.score;
    } else {
      uniqueTerms.set(key, {
        ...term,
      });
    }
  }

  terms = [...uniqueTerms.values()];

  /*
   * 10. Remove standalone words that are already
   * represented by stronger phrases.
   */
  terms = removeRedundantTerms(
    terms,
  );

  /*
   * 11. Sort by importance.
   */
  terms.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (b.count !== a.count) {
      return b.count - a.count;
    }

    /*
     * Prefer phrases when scores are equal.
     */
    const aIsPhrase =
      a.text.includes(" ");

    const bIsPhrase =
      b.text.includes(" ");

    if (aIsPhrase && !bIsPhrase) {
      return -1;
    }

    if (!aIsPhrase && bIsPhrase) {
      return 1;
    }

    return a.text.localeCompare(
      b.text,
    );
  });

  /*
   * 12. Keep a maximum of 30 terms.
   */
  terms = terms.slice(0, 30);

  /*
   * 13. Convert internal scores into the
   * frontend's { text, value } format.
   */
  return calculateProminence(
    terms,
  );
}