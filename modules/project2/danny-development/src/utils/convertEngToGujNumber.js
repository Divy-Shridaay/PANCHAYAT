export function convertEngToGujNumber(englishNumber) {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return englishNumber
    ?.toString()
    .split('')
    .map(digit => (/\d/.test(digit) ? gujaratiDigits[digit] : digit))
    .join('');
}

