/**
 * Donation / about config — set via env (public, display-only).
 */
export type DonateLink = {
  key: string;
  label: string;
  href: string;
  hint?: string;
};

export function getCreatorUsername(): string {
  return process.env.NEXT_PUBLIC_CREATOR_USERNAME?.trim() || "agungtsp";
}

const DEFAULT_SAWERIA = "https://saweria.co/agungtsp";

export function getDonateLinks(): DonateLink[] {
  const links: DonateLink[] = [];
  const saweria =
    process.env.NEXT_PUBLIC_DONATE_SAWERIA?.trim() || DEFAULT_SAWERIA;
  const trakteer = process.env.NEXT_PUBLIC_DONATE_TRAKTEER?.trim();
  const paypal = process.env.NEXT_PUBLIC_DONATE_PAYPAL?.trim();
  const customUrl = process.env.NEXT_PUBLIC_DONATE_URL?.trim();
  const customLabel =
    process.env.NEXT_PUBLIC_DONATE_LABEL?.trim() || "Kirim donasi";

  if (saweria) {
    links.push({
      key: "saweria",
      label: "Donasi via Saweria",
      href: saweria,
      hint: "Buka halaman Saweria",
    });
  }
  if (trakteer) {
    links.push({
      key: "trakteer",
      label: "Donasi via Trakteer",
      href: trakteer,
      hint: "Dukung dengan trakteeran",
    });
  }
  if (paypal) {
    links.push({
      key: "paypal",
      label: "Donasi via PayPal",
      href: paypal,
    });
  }
  if (customUrl) {
    links.push({
      key: "custom",
      label: customLabel,
      href: customUrl,
    });
  }
  return links;
}

export function getBankDonation(): {
  bank: string;
  account: string;
  holder: string;
} | null {
  const bank = process.env.NEXT_PUBLIC_DONATE_BANK_NAME?.trim();
  const account = process.env.NEXT_PUBLIC_DONATE_BANK_ACCOUNT?.trim();
  const holder = process.env.NEXT_PUBLIC_DONATE_BANK_HOLDER?.trim();
  if (!bank || !account) return null;
  return { bank, account, holder: holder || "" };
}
