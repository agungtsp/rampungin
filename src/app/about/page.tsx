import type { Metadata } from "next";
import Link from "next/link";
import { DonateOptions } from "@/components/DonateOptions";
import {
  getBankDonation,
  getCreatorUsername,
  getDonateLinks,
} from "@/lib/about";

export const metadata: Metadata = {
  title: "Tentang & Donasi — Rampungin",
  description:
    "Kenali Rampungin dan dukung pengembangan marketplace prompt AI gratis.",
};

export default function AboutPage() {
  const username = getCreatorUsername();
  const donateLinks = getDonateLinks();
  const bank = getBankDonation();
  const hasDonate = donateLinks.length > 0 || bank;

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-3 py-8 sm:px-6 sm:py-12">
      <section className="space-y-4">
        <p className="text-sm font-semibold text-primary">Tentang</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Selamat datang di Rampungin
        </h1>
        <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
          Rampungin adalah marketplace komunitas untuk berbagi{" "}
          <strong className="font-semibold text-ink">prompt AI</strong> —
          baik template berparameter maupun prompt siap pakai. Siapa saja dapat
          menjelajah, mengisi field, menyalin hasil, dan ikut membagikan tanpa
          biaya.
        </p>
        <p className="text-base leading-relaxed text-ink-muted">
          Platform ini dibuat agar prompt yang bermanfaat tidak hilang di chat
          pribadi: mudah ditemukan, dipakai ulang, dan terus berkembang bersama
          komunitas.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-secondary/50">
        <div className="h-20 bg-gradient-to-r from-primary-hover via-primary to-secondary" />
        <div className="relative px-5 pb-6 sm:px-6">
          <div className="-mt-8 flex flex-wrap items-end gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-primary font-display text-2xl font-bold text-white shadow-md">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div className="pb-1">
              <h2 className="font-display text-xl font-semibold text-ink">
                Pembuat
              </h2>
              <p className="text-ink-muted">@{username}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Halo — saya mengembangkan Rampungin di waktu luang sebagai ruang
            gratis untuk berbagi konteks prompt. Jika platform ini membantu
            alur kerjamu, kamu boleh mendukung lewat donasi di bawah. Setiap
            kontribusi digunakan untuk biaya server, pemeliharaan, dan fitur
            baru.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/profile/${username}`}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Lihat profil @{username}
            </Link>
            <Link
              href="/tutorial"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-soft"
            >
              Baca panduan
            </Link>
          </div>
        </div>
      </section>

      <section id="donasi" className="scroll-mt-20 space-y-4">
        <span id="sumbangan" className="sr-only" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Donasi</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Dukung Rampungin tetap berkembang
          </h2>
          <p className="text-ink-muted">
            Donasi bersifat sukarela. Semua fitur tetap gratis — tanpa paywall.
            Terima kasih atas dukungannya.
          </p>
        </div>

        {hasDonate ? (
          <DonateOptions />
        ) : (
          <div className="rounded-2xl bg-white px-4 py-5 text-sm text-ink-muted ring-1 ring-secondary/50">
            <p>
              Channel donasi belum dikonfigurasi. Sementara itu, cara terbaik
              mendukung adalah{" "}
              <Link href="/prompts/new" className="font-medium text-primary underline">
                membagikan prompt berkualitas
              </Link>{" "}
              dan mengajak teman memakai Rampungin.
            </p>
            <p className="mt-3 text-ink-muted">
              Admin: isi{" "}
              <code className="rounded bg-soft px-1 text-xs">
                NEXT_PUBLIC_DONATE_*
              </code>{" "}
              di <code className="rounded bg-soft px-1 text-xs">.env</code>{" "}
              (lihat{" "}
              <code className="rounded bg-soft px-1 text-xs">
                .env.local.example
              </code>
              ).
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-primary-hover px-5 py-6 text-center text-white sm:px-8">
        <h2 className="font-display text-xl font-semibold">
          Punya ide atau masukan?
        </h2>
        <p className="mt-2 text-sm text-soft">
          Hubungi pembuat lewat profil, atau mulai dengan membuat prompt
          pertamamu.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href={`/profile/${username}`}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-soft"
          >
            Hubungi @{username}
          </Link>
          <Link
            href="/prompts/new"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Buat prompt
          </Link>
        </div>
      </section>
    </main>
  );
}
