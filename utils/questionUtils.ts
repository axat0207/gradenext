// utils/questionUtils.ts
export function formatMathContent(text: string): string {
  return text
    .replace(/\\$$|\\$$/g, "")
    .replace(/\*/g, "×")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeQuestionContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s×]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateQuestionHash(
  question: string,
  options: string[]
): string {
  const content = `${question.toLowerCase()}${options.join("").toLowerCase()}`;
  return Array.from(content)
    .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
    .toString(36);
}
