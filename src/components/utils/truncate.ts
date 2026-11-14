/**
 * `text` cut to at most `max` characters, with "..." appended when anything
 * was cut. Counts characters, not UTF-16 units, so an emoji or accented
 * letter is never split; trailing space before the dots is dropped.
 */
export const truncate = (text: string, max: number): string => {
  const chars = Array.from(text);

  return chars.length > max
    ? `${chars.slice(0, max).join("").trimEnd()}...`
    : text;
};
