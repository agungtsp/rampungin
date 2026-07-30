/** Normalize WhatsApp phone for storage and build wa.me links. */

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return hasPlus || trimmed.startsWith("00") ? `+${digits.replace(/^00/, "")}` : digits;
}

/** Digits only for https://wa.me/<digits> (no +). */
export function phoneDigitsForWa(phone: string): string {
  return normalizePhone(phone).replace(/\D/g, "");
}

export function whatsAppLink(phone: string): string {
  const digits = phoneDigitsForWa(phone);
  return digits ? `https://wa.me/${digits}` : "";
}

export function isValidPhone(raw: string): boolean {
  const digits = phoneDigitsForWa(raw);
  return digits.length >= 8 && digits.length <= 15;
}
