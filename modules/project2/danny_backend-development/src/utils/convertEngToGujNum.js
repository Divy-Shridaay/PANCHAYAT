
function convertEngToGujNumber(englishNumber) {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];

  if (englishNumber === null || englishNumber === undefined) return "";

  return englishNumber
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? gujaratiDigits[digit] : digit))
    .join("");
}

module.exports = {
  convertEngToGujNumber,
};
