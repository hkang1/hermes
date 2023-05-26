const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARACTERS = `0123456789${LETTERS}`;
const DEFAULT_ALPHA_NUMERIC_LENGTH = 8;

export function camelCaseToKebab(text: string): string {
  return text
    .trim()
    .split('')
    .map((char, index) => {
      return char === char.toUpperCase()
        ? `${index !== 0 ? '-' : ''}${char.toLowerCase()}`
        : char;
    })
    .join('');
}

export function generateAlphaNumeric(
  length = DEFAULT_ALPHA_NUMERIC_LENGTH,
  chars = CHARACTERS,
): string {
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
