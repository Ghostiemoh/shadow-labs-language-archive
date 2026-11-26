export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Yarasude";
export const SHOW_DRAFTS = process.env.NEXT_PUBLIC_SHOW_DRAFTS !== "false";

// Which statuses the public site shows.
export const VISIBLE: string[] = SHOW_DRAFTS ? ["approved", "pending"] : ["approved"];

export const ERROR_TAGS: { id: string; label: string; hint: string }[] = [
  { id: "tone", label: "Tone marks", hint: "Missing or wrong tone / diacritics" },
  { id: "spelling", label: "Spelling", hint: "Letters wrong, e.g. hooked letters ɓ ɗ ƙ or dot-below ẹ ọ ṣ" },
  { id: "wrong_word", label: "Wrong word", hint: "A word exists but is not the right one here" },
  { id: "wrong_meaning", label: "Wrong meaning", hint: "The sentence says something different" },
  { id: "grammar", label: "Grammar", hint: "Word order, agreement, tense" },
  { id: "unnatural", label: "Unnatural", hint: "Understandable but no native speaker says it this way" },
  { id: "untranslated", label: "Left in English", hint: "Words copied instead of translated" },
  { id: "dialect", label: "Dialect", hint: "Belongs to another dialect than the one asked for" },
  { id: "ok", label: "Draft was correct", hint: "Nothing to fix" },
];
