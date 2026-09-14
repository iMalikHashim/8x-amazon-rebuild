/** Luhn checksum - the same algorithm real card networks use to catch typos. */
export function isValidCardNumber(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Accepts MM/YY or MM/YYYY, rejects the wrong shape and past dates. */
export function isValidExpiry(raw: string): boolean {
  const match = raw.trim().match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return false;

  const month = Number(match[1]);
  if (month < 1 || month > 12) return false;

  const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function isValidCvc(raw: string): boolean {
  return /^\d{3,4}$/.test(raw.trim());
}
