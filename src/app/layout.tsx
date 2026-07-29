import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { LocaleProvider } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import {
  buildPageMetadata,
  getSiteUrl,
  SITE_NAME,
  siteCopy,
} from "@/lib/seo";
import { themeClass, THEME_COOKIE } from "@/lib/theme";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme/server";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = siteCopy(locale);
  const base = buildPageMetadata({
    locale,
    barePath: "/",
    title: copy.title,
    description: copy.description,
  });

  return {
    ...base,
    metadataBase: new URL(getSiteUrl()),
    applicationName: SITE_NAME,
    title: {
      default: copy.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: copy.description,
    keywords: [
      "AI prompt",
      "ChatGPT",
      "Gemini",
      "prompt marketplace",
      "template prompt",
      "Rampungin",
      "prompt gratis",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    icons: {
      icon: [{ url: "/brand/rampungin-mark.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-icon", type: "image/png" }],
    },
  };
}

const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m?decodeURIComponent(m[1]):"light";if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.style.colorScheme="light";}}catch(e){}})();`;

function supabaseOrigin(): string | null {
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return u ? new URL(u).origin : null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const theme = await getServerTheme();
  const storageOrigin = supabaseOrigin();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: siteCopy(locale).description,
    inLanguage: locale === "en" ? "en" : "id",
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/${locale}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={locale}
      className={themeClass(theme)}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <head>
        {storageOrigin ? (
          <>
            <link rel="preconnect" href={storageOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={storageOrigin} />
          </>
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rampungin" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} relative flex min-h-screen flex-col font-sans text-ink antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider initialTheme={theme}>
            <div className="ai-site-bg" aria-hidden="true" />
            <div className="relative z-10 flex min-h-screen flex-col">
              {/* Auth resolved client-side — avoids blocking document TTFB on Supabase */}
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <SiteFooter />
            </div>
            <SiteAnalytics />
            <ServiceWorkerRegister />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
