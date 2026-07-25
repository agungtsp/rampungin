import type { Metadata } from "next";
import Link from "next/link";
import { DonateOptions } from "@/components/DonateOptions";
import {
  getBankDonation,
  getCreatorUsername,
  getDonateLinks,
} from "@/lib/about";
import { localePath } from "@/lib/i18n/paths";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  if (locale === "en") {
    return {
      title: "About & Donate — Rampungin",
      description:
        "Learn about Rampungin and support the free AI prompt marketplace.",
    };
  }
  return {
    title: "Tentang & Donasi — Rampungin",
    description:
      "Kenali Rampungin dan dukung pengembangan marketplace prompt AI gratis.",
  };
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const en = locale === "en";
  const username = getCreatorUsername();
  const donateLinks = getDonateLinks();
  const bank = getBankDonation();
  const hasDonate = donateLinks.length > 0 || bank;
  const profileHref = localePath(locale, `/profile/${username}`);
  const tutorialHref = localePath(locale, "/tutorial");
  const newPromptHref = localePath(locale, "/prompts/new");

  const copy = en
    ? {
        eyebrow: "About",
        title: "Welcome to Rampungin",
        p1: (
          <>
            Rampungin is a community marketplace for sharing{" "}
            <strong className="font-semibold text-ink">AI prompts</strong> —
            both parameterized templates and ready-to-use prompts. Anyone can
            browse, fill fields, copy results, and share for free.
          </>
        ),
        p2: "The platform exists so useful prompts don’t disappear in private chats: easy to find, reuse, and grow with the community.",
        creator: "Creator",
        creatorBio:
          "Hi — I build Rampungin in my spare time as a free space to share prompt context. If it helps your workflow, you’re welcome to support via donations below. Contributions go to hosting, maintenance, and new features.",
        viewProfile: `View @${username} profile`,
        readGuide: "Read the guide",
        donateEyebrow: "Donate",
        donateTitle: "Help Rampungin keep growing",
        donateBody:
          "Donations are voluntary. Every feature stays free — no paywall. Thank you for your support.",
        noDonate: (
          <>
            Donation channels aren’t configured yet. For now, the best way to
            help is{" "}
            <Link
              href={newPromptHref}
              className="font-medium text-primary underline"
            >
              sharing quality prompts
            </Link>{" "}
            and inviting friends to use Rampungin.
          </>
        ),
        ideasTitle: "Have ideas or feedback?",
        ideasBody:
          "Reach the creator via their profile, or start by creating your first prompt.",
        contact: `Contact @${username}`,
        create: "Create prompt",
      }
    : {
        eyebrow: "Tentang",
        title: "Selamat datang di Rampungin",
        p1: (
          <>
            Rampungin adalah marketplace komunitas untuk berbagi{" "}
            <strong className="font-semibold text-ink">prompt AI</strong> —
            baik template berparameter maupun prompt siap pakai. Siapa saja
            dapat menjelajah, mengisi field, menyalin hasil, dan ikut membagikan
            tanpa biaya.
          </>
        ),
        p2: "Platform ini dibuat agar prompt yang bermanfaat tidak hilang di chat pribadi: mudah ditemukan, dipakai ulang, dan terus berkembang bersama komunitas.",
        creator: "Pembuat",
        creatorBio:
          "Halo — saya mengembangkan Rampungin di waktu luang sebagai ruang gratis untuk berbagi konteks prompt. Jika platform ini membantu alur kerjamu, kamu boleh mendukung lewat donasi di bawah. Setiap kontribusi digunakan untuk biaya server, pemeliharaan, dan fitur baru.",
        viewProfile: `Lihat profil @${username}`,
        readGuide: "Baca panduan",
        donateEyebrow: "Donasi",
        donateTitle: "Dukung Rampungin tetap berkembang",
        donateBody:
          "Donasi bersifat sukarela. Semua fitur tetap gratis — tanpa paywall. Terima kasih atas dukungannya.",
        noDonate: (
          <>
            Channel donasi belum dikonfigurasi. Sementara itu, cara terbaik
            mendukung adalah{" "}
            <Link
              href={newPromptHref}
              className="font-medium text-primary underline"
            >
              membagikan prompt berkualitas
            </Link>{" "}
            dan mengajak teman memakai Rampungin.
          </>
        ),
        ideasTitle: "Punya ide atau masukan?",
        ideasBody:
          "Hubungi pembuat lewat profil, atau mulai dengan membuat prompt pertamamu.",
        contact: `Hubungi @${username}`,
        create: "Buat prompt",
      };

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-3 py-8 sm:px-6 sm:py-12">
      <section className="space-y-4">
        <p className="text-sm font-semibold text-primary">{copy.eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {copy.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
          {copy.p1}
        </p>
        <p className="text-base leading-relaxed text-ink-muted">{copy.p2}</p>
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
                {copy.creator}
              </h2>
              <p className="text-ink-muted">@{username}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {copy.creatorBio}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={profileHref}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {copy.viewProfile}
            </Link>
            <Link
              href={tutorialHref}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-soft"
            >
              {copy.readGuide}
            </Link>
          </div>
        </div>
      </section>

      <section id="donasi" className="scroll-mt-20 space-y-4">
        <span id="sumbangan" className="sr-only" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">
            {copy.donateEyebrow}
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {copy.donateTitle}
          </h2>
          <p className="text-ink-muted">{copy.donateBody}</p>
        </div>

        {hasDonate ? (
          <DonateOptions />
        ) : (
          <div className="rounded-2xl bg-white px-4 py-5 text-sm text-ink-muted ring-1 ring-secondary/50">
            <p>{copy.noDonate}</p>
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
        <h2 className="font-display text-xl font-semibold">{copy.ideasTitle}</h2>
        <p className="mt-2 text-sm text-soft">{copy.ideasBody}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href={profileHref}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-soft"
          >
            {copy.contact}
          </Link>
          <Link
            href={newPromptHref}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {copy.create}
          </Link>
        </div>
      </section>
    </main>
  );
}
