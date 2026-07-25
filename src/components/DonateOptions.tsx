import Link from "next/link";
import {
  getBankDonation,
  getDonateLinks,
  type DonateLink,
} from "@/lib/about";

function MoneyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function DonateLinkButton({ link }: { link: DonateLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
    >
      <MoneyIcon className="h-5 w-5" />
      {link.label}
    </a>
  );
}

type Props = {
  /** Compact layout for modal */
  compact?: boolean;
  /** Called when user follows an in-app link (e.g. about) */
  onNavigate?: () => void;
};

export function DonateOptions({ compact = false, onNavigate }: Props) {
  const links = getDonateLinks();
  const bank = getBankDonation();
  const hasDonate = links.length > 0 || bank;

  if (!hasDonate) {
    return (
      <p
        className={`rounded-xl bg-soft px-4 py-3 text-sm text-ink-muted ${
          compact ? "" : "rounded-2xl ring-1 ring-secondary/50"
        }`}
      >
        Channel donasi belum dikonfigurasi. Sementara itu, lihat halaman{" "}
        <Link
          href="/about#donasi"
          className="font-medium text-primary underline"
          onClick={onNavigate}
        >
          Tentang &amp; Donasi
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <DonateLinkButton key={link.key} link={link} />
      ))}

      {bank ? (
        <div
          className={`bg-soft ring-1 ring-primary/15 ${
            compact ? "rounded-xl px-4 py-3" : "rounded-2xl px-4 py-4"
          }`}
        >
          <p className="text-sm font-semibold text-primary-hover">
            Transfer bank
          </p>
          {compact ? (
            <>
              <p className="mt-1 text-sm font-medium text-ink">{bank.bank}</p>
              <p className="font-mono text-sm text-ink">{bank.account}</p>
              {bank.holder ? (
                <p className="text-xs text-ink-muted">a.n. {bank.holder}</p>
              ) : null}
            </>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Bank</dt>
                <dd className="font-medium text-ink">{bank.bank}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">No. rekening</dt>
                <dd className="font-mono font-medium text-ink">{bank.account}</dd>
              </div>
              {bank.holder ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Atas nama</dt>
                  <dd className="font-medium text-ink">{bank.holder}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      ) : null}
    </div>
  );
}
