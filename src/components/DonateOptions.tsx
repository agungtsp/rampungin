import Link from "next/link";
import {
  getBankDonation,
  getDonateLinks,
  type DonateLink,
} from "@/lib/about";

function DonateEmbed({ link }: { link: DonateLink }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-soft ring-1 ring-primary/15">
      <div className="border-b border-secondary/40 px-4 py-3">
        <p className="text-sm font-semibold text-ink">{link.label}</p>
        {link.hint ? (
          <p className="text-xs text-ink-muted">{link.hint}</p>
        ) : null}
      </div>
      <div className="bg-white p-2 sm:p-3">
        <iframe
          src={link.href}
          title={`${link.label} QR donasi`}
          className="mx-auto block h-[380px] w-full max-w-[320px] rounded-xl border-0 bg-white"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="payment *"
        />
      </div>
    </div>
  );
}

function DonateExternalLink({ link }: { link: DonateLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-secondary/50 transition hover:ring-secondary/30 hover:shadow-card"
    >
      <div>
        <p className="font-semibold text-ink">{link.label}</p>
        {link.hint ? (
          <p className="text-sm text-ink-muted">{link.hint}</p>
        ) : null}
      </div>
      <span className="shrink-0 text-sm font-semibold text-primary">Buka →</span>
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
  const embeds = links.filter((l) => l.embed);
  const externals = links.filter((l) => !l.embed);

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
    <div className={compact ? "space-y-3" : "space-y-3"}>
      {embeds.map((link) => (
        <DonateEmbed key={link.key} link={link} />
      ))}

      {externals.map((link) => (
        <DonateExternalLink key={link.key} link={link} />
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
