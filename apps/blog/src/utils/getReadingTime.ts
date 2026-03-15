import readingTime from "reading-time";

export function getReadingTime(content: string): string {
  const result = readingTime(content);
  return result.text;
}

export function getReadingTimeMinutes(content: string): number {
  const result = readingTime(content);
  return Math.ceil(result.minutes);
}
