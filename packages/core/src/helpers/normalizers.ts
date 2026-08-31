const CHAR_MAP: Record<string, string> = {
  'ك': 'ک',
  'دِ': 'د',
  'بِ': 'ب',
  'زِ': 'ز',
  'ذِ': 'ذ',
  'شِ': 'ش',
  'سِ': 'س',
  'ى': 'ی',
  'ي': 'ی',
  '١': '۱',
  '٢': '۲',
  '٣': '۳',
  '٤': '۴',
  '٥': '۵',
  '٦': '۶',
  '٧': '۷',
  '٨': '۸',
  '٩': '۹',
  '٠': '۰',
};

/**
 * Converts Arabic characters and Arabic digits to standard Persian equivalents.
 */
export function arabicToPersian(str: string): string {
  let result = str;
  for (const [search, replacement] of Object.entries(CHAR_MAP)) {
    result = result.replace(new RegExp(search, 'g'), replacement);
  }
  return result;
}

/**
 * Converts English digits in a string or number to Persian digits.
 */
export function toFarsiNumber(n: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .split('')
    .map((x) => (x >= '0' && x <= '9' ? farsiDigits[Number(x)] : x))
    .join('');
}

/**
 * Converts Persian numbers represented as a string into an English number value.
 */
export function convertPersianNumToEng(number: string): number {
  const persianNumDifference = '۱'.charCodeAt(0) - '1'.charCodeAt(0);
  let res = 0;
  for (let i = 0; i < number.length; i++) {
    res *= 10;
    const charCode = number[i].charCodeAt(0);
    res += (charCode > 256 ? charCode - persianNumDifference : charCode) - '0'.charCodeAt(0);
  }
  return res;
}

/**
 * Normalizes Persian day strings to standard representation with ZWNJ (نیم‌فاصله).
 */
export function normalizeDayName(rawDay?: string): string {
  const d = (rawDay || "").replace(/[^\u0600-\u06FF]/g, "").trim();
  if (d.includes("یک")) return "یک‌شنبه";
  if (d.includes("سه")) return "سه‌شنبه";
  if (d.includes("دو")) return "دوشنبه";
  if (d.includes("چهار")) return "چهارشنبه";
  if (d.includes("پنج")) return "پنج‌شنبه";
  if (d.includes("جمعه")) return "جمعه";
  if (d.includes("شنبه")) return "شنبه";
  return d;
}
