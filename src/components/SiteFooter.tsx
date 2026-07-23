import Link from "next/link";
import { RampunginLogo } from "./RampunginLogo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <RampunginLogo className="mt-0.5 h-9 w-9 shrink-0" />
          <div>
            <p className="font-display text-sm font-semibold text-zinc-900">
              Rampungin
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Marketplace prompt AI gratis untuk semua.
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <Link href="/trending" className="transition hover:text-zinc-900">
            Trending
          </Link>
          <Link href="/people" className="transition hover:text-zinc-900">
            Profil
          </Link>
          <Link href="/tutorial" className="transition hover:text-zinc-900">
            Panduan
          </Link>
          <Link href="/about" className="transition hover:text-zinc-900">
            Tentang
          </Link>
          <Link href="/about#sumbangan" className="transition hover:text-zinc-900">
            Sumbangan
          </Link>
          <Link href="/prompts/new" className="transition hover:text-zinc-900">
            Buat prompt
          </Link>
        </nav>
      </div>
    </footer>
  );
}
