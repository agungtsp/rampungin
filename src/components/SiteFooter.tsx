import Link from "next/link";
import { RampunginLogo } from "./RampunginLogo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-secondary/60 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <RampunginLogo className="mt-0.5 h-9 w-9 shrink-0" />
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              Rampungin
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Marketplace prompt AI gratis untuk semua.
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-ink-muted">
          <Link href="/trending" className="transition hover:text-ink">
            Trending
          </Link>
          <Link href="/people" className="transition hover:text-ink">
            Kreator
          </Link>
          <Link href="/tutorial" className="transition hover:text-ink">
            Panduan
          </Link>
          <Link href="/about" className="transition hover:text-ink">
            Tentang
          </Link>
          <Link href="/about#donasi" className="transition hover:text-ink">
            Donasi
          </Link>
          <Link href="/prompts/new" className="transition hover:text-ink">
            Buat prompt
          </Link>
        </nav>
      </div>
    </footer>
  );
}
