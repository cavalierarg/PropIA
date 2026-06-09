export function balanceTitle(text: string): string {
  const words = text.trim().split(/s+/);
  if (words.length < 3) return text;
  const lastSpace = text.lastIndexOf(' ');
  return text.slice(0, lastSpace) + ' ' + text.slice(lastSpace + 1);
}
