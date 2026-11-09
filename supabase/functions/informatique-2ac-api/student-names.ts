/** Shared browser/server validation. Invalid historical records are preserved. */
export function isSuggestibleStudentName(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const name = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  if (name.length < 2 || name.length > 100 || !/^[\p{L}\p{M}\s.'’ʼ-]+$/u.test(name)) return false;
  const letters = name.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) return false;
  const words = name.toLocaleLowerCase("fr").match(/\p{L}[\p{L}\p{M}]*/gu) ?? [];
  // Hide obvious keyboard trials ("aaaa aaa") without guessing a learner's identity.
  if (words.every(word => new Set([...word]).size === 1)) return false;
  const markers = new Set(["test", "tests", "demo", "demonstration", "exemple"]);
  return !words.some(word => markers.has(word.normalize("NFD").replace(/\p{M}/gu, "")));
}
