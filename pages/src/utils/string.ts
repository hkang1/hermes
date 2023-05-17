export const camelCaseToKebab = (text: string): string => {
  return text
    .trim()
    .split('')
    .map((char, index) => {
      return char === char.toUpperCase()
        ? `${index !== 0 ? '-' : ''}${char.toLowerCase()}`
        : char;
    })
    .join('');
};
