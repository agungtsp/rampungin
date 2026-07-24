/**
 * Donation / about config — set via env (public, display-only).
 */
export type DonateLink = {
  key: string;
  label: string;
  href: string;
  hint?: string;
  /** Embed as iframe (e.g. Saweria QR widget) instead of opening a new tab */
  embed?: boolean;
};

export function getCreatorUsername(): string {
  return process.env.NEXT_PUBLIC_CREATOR_USERNAME?.trim() || "agungtsp";
}

/** True when URL is a Saweria (or similar) QR/widget page meant for iframe embed. */
export function isDonateWidgetUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return (
      u.hostname.includes("saweria.co") &&
      (u.pathname.includes("/widgets/") || u.searchParams.has("streamKey"))
    );
  } catch {
    return /saweria\.co\/widgets\//i.test(href);
  }
}

export function getDonateLinks(): DonateLink[] {
  const links: DonateLink[] = [];
  const saweria = process.env.NEXT_PUBLIC_DONATE_SAWERIA?.trim();
  const trakteer = process.env.NEXT_PUBLIC_DONATE_TRAKTEER?.trim();
  const paypal = process.env.NEXT_PUBLIC_DONATE_PAYPAL?.trim();
  const customUrl = process.env.NEXT_PUBLIC_DONATE_URL?.trim();
  const customLabel =
    process.env.NEXT_PUBLIC_DONATE_LABEL?.trim() || "Kirim donasi";

  if (saweria) {
    const embed = isDonateWidgetUrl(saweria);
    links.push({
      key: "saweria",
      label: "Saweria",
      href: saweria,
      hint: embed ? "Scan QRIS atau e-wallet" : "Cepat via e-wallet atau QRIS",
      embed,
    });
  }
  if (trakteer) {
    links.push({
      key: "trakteer",
      label: "Trakteer",
      href: trakteer,
      hint: "Dukung dengan trakteeran",
    });
  }
  if (paypal) {
    links.push({
      key: "paypal",
      label: "PayPal",
      href: paypal,
    });
  }
  if (customUrl) {
    links.push({
      key: "custom",
      label: customLabel,
      href: customUrl,
      embed: isDonateWidgetUrl(customUrl),
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
