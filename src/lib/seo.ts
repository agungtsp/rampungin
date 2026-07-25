import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/paths";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "http://localhost:3000";
  const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProto.replace(/\/$/, "");
}

export const SITE_NAME = "Rampungin";

export function siteCopy(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Rampungin — Free AI Prompt Marketplace",
      description:
        "Browse and share ready-to-use AI prompts. Parameterized templates, free forever.",
      ogLocale: "en_US",
    };
  }
  return {
    title: "Rampungin — Marketplace Prompt AI Gratis",
    description:
      "Jelajahi dan bagikan prompt AI siap pakai. Template berparameter, gratis selamanya.",
    ogLocale: "id_ID",
  };
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical + hreflang for a bare site path (e.g. /trending, /profile/x/y). */
export function localeAlternates(locale: Locale, barePath: string) {
  const path = barePath.startsWith("/") ? barePath : `/${barePath}`;
  return {
    canonical: absoluteUrl(localePath(locale, path)),
    languages: {
      id: absoluteUrl(localePath("id", path)),
      en: absoluteUrl(localePath("en", path)),
      "x-default": absoluteUrl(localePath("id", path)),
    },
  };
}

type BuildMetaOpts = {
  locale: Locale;
  barePath: string;
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  publishedTime?: string | null;
};

export function buildPageMetadata({
  locale,
  barePath,
  title,
  description,
  image,
  type = "website",
  noIndex = false,
  publishedTime,
}: BuildMetaOpts): Metadata {
  const copy = siteCopy(locale);
  const pageTitle = title ?? copy.title;
  const pageDesc = description ?? copy.description;
  const ogImage = image
    ? absoluteUrl(image)
    : absoluteUrl("/opengraph-image");
  const alternates = localeAlternates(locale, barePath);

  return {
    title: pageTitle,
    description: pageDesc,
    alternates,
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: copy.ogLocale,
      url: alternates.canonical,
      title: pageTitle,
      description: pageDesc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [ogImage],
    },
  };
}

export function noIndexMetadata(locale: Locale, barePath: string, title: string): Metadata {
  return buildPageMetadata({
    locale,
    barePath,
    title,
    noIndex: true,
  });
}
