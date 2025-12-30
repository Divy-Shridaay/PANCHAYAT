export function toEnglish(str) {
  const map = { "૦":"0","૧":"1","૨":"2","૩":"3","૪":"4",
                "૫":"5","૬":"6","૭":"7","૮":"8","૯":"9" };
  return str.replace(/[૦-૯]/g, d => map[d]);
}

// Basic Gujarati to English transliteration
export function transliterateGujaratiToEnglish(str) {
  const map = {
    // Vowels
    'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ee', 'ઉ': 'u', 'ઊ': 'oo', 'ઋ': 'ri', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
    // Consonants
    'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
    'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh', 'ઞ': 'ny',
    'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
    'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
    'પ': 'p', 'ફ': 'ph', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
    'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v', 'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h',
    // Matras (vowel signs)
    'ા': 'a', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ૃ': 'ri', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au',
    // Halant
    '્': '',
    // Special characters
    'ં': 'n', 'ઃ': 'h'
  };

  let result = '';
  for (let char of str) {
    result += map[char] || char; // If not in map, keep as is
  }
  return result.toLowerCase().replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric and lowercase
}
