import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LocaleProvider } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import { themeClass, THEME_COOKIE } from "@/lib/theme";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme/server";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rampungin — Marketplace Prompt AI Gratis",
  description:
    "Jelajahi dan bagikan prompt AI siap pakai. Template berparameter, gratis selamanya.",
  icons: {
    icon: [{ url: "/brand/rampungin-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m?decodeURIComponent(m[1]):"light";if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.style.colorScheme="light";}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const theme = await getServerTheme();

  return (
    <html
      lang={locale}
      className={themeClass(theme)}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${sans.variable} ${display.variable} relative flex min-h-screen flex-col font-sans text-ink antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider initialTheme={theme}>
            <div className="ai-site-bg" aria-hidden="true" />
            <div className="relative z-10 flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <SiteFooter />
            </div>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
