
const gujaratiNumbers = [
  "શૂન્ય", "એક", "બે", "ત્રણ", "ચાર", "પાંચ", "છ", "સાત", "આઠ", "નવ", "દસ",
  "અગિયાર", "બાર", "તેર", "ચૌદ", "પંદર", "સોળ", "સત્તર", "અઢાર", "ઓગણીસ",
  "વીસ", "એકવીસ", "બાવીસ", "ત્રેવીસ", "ચોવીસ", "પચ્ચીસ", "છવ્વીસ", "સત્તાવીસ", "અઠ્ઠાવીસ", "ઓગણત્રીસ",
  "ત્રીસ", "એકત્રીસ", "બત્રીસ", "ત્તેત્રીસ", "ચોત્રીસ", "પાત્રીસ", "છત્રીસ", "સાડત્રીસ", "આઢત્રીસ", "ઓગણચાળીસ",
  "ચાળીસ", "એકતાળીસ", "બેતાળીસ", "તેતાળીસ", "ચુમ્માળીસ", "પીસ્તાળીસ", "છેતાળીસ", "સુળતાળીસ", "અળતાળીસ", "ઓગણપચાસ",
  "પચાસ", "એકાવન", "બાવન", "ત્રેપન", "ચોપન", "પંચાવન", "છપ્પન", "સત્તાવન", "અઠ્ઠાવન", "ઓગણસાઠ",
  "સાઠ", "એકસઠ", "બાસઠ", "ત્રેસઠ", "ચોસઠ", "પાંસઠ", "છાસઠ", "સડસઠ", "અઢસઠ", "ઓગણસિત્તેર",
  "સિત્તેર", "એકોતેર", "બોત્તેર", "તોત્તેર", "ચુંવોતેર", "પંચોતેર", "છોત્તેર", "સિતોતેર", "અઠ્ઠોતેર", "ઓગણએંસી",
  "એંસી", "એક્યાસી", "બ્યાસી", "ત્યાસી", "ચોર્યાસી", "પંચ્યાસી", "છયાસી", "સિત્યાસી", "અઠ્ઠ્યાસી", "ઓગણનેવું",
  "નેવું", "એકાણું", "બાણું", "ત્રાણું", "ચોરાણું", "પંચાણું", "છંનુ", "સત્તાણું", "અઠ્ઠાણું", "નવ્વાણું", "સો"
];

function convertNumberToGujarati(num) {
  if (num < 100) {
    return gujaratiNumbers[num];
  }

  let result = "";

  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    result += `${convertNumberToGujarati(crore)} કરોડ `;
    num %= 10000000;
  }

  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    result += `${convertNumberToGujarati(lakh)} લાખ `;
    num %= 100000;
  }

  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    result += `${convertNumberToGujarati(thousand)} હજાર `;
    num %= 1000;
  }

  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    result += `${convertNumberToGujarati(hundred)} સો `;
    num %= 100;
  }

  if (num > 0) {
    result += convertNumberToGujarati(num);
  }

  return result.trim();
}


export function convertToCurrencyWords(amount) {
  if (isNaN(amount)) return "";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const rupeesWord = rupees > 0 ? convertNumberToGujarati(rupees) + " રૂપિયા" : "";
  const paiseWord = paise > 0 ? convertNumberToGujarati(paise) + " પૈસા" : "";

  let result = "";
  if (rupeesWord && paiseWord) {
    result = `${rupeesWord} અને ${paiseWord}`;
  } else if (rupeesWord) {
    result = rupeesWord;
  } else if (paiseWord) {
    result = paiseWord;
  } else {
    result = "શૂન્ય રૂપિયા";
  }

  return "માત્ર " + result ;
}

export function convertEnglishToGujaratiNumber(englishNumber) {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return englishNumber
    .toString()
    .split('')
    .map(digit => (/\d/.test(digit) ? gujaratiDigits[digit] : digit))
    .join('');
}

