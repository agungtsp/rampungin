"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { getGaMeasurementId, trackPageView } from "@/lib/analytics";

function histatsId(): string {
  return (process.env.NEXT_PUBLIC_HISTATS_ID ?? "").trim();
}

/** Tracks App Router navigations so GA sees every virtual page view. */
function GaRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!getGaMeasurementId()) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

/** Google Analytics 4 (gtag.js) + Histats — only load when env IDs are set. */
export function SiteAnalytics() {
  const ga = getGaMeasurementId();
  const histats = histatsId();

  if (!ga && !histats) return null;

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${ga}', {
                anonymize_ip: true,
                send_page_view: false
              });
            `}
          </Script>
          <Suspense fallback={null}>
            <GaRouteTracker />
          </Suspense>
        </>
      ) : null}

      {histats ? (
        <>
          <Script id="histats-init" strategy="lazyOnload">
            {`
              var _Hasync = _Hasync || [];
              _Hasync.push(['Histats.start', '1,${histats},4,0,0,0,00010000']);
              _Hasync.push(['Histats.fasi', '1']);
              _Hasync.push(['Histats.track_hits', '']);
              (function() {
                var hs = document.createElement('script');
                hs.type = 'text/javascript';
                hs.async = true;
                hs.src = ('//s10.histats.com/js15_as.js');
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
              })();
            `}
          </Script>
          <noscript>
            <a href="https://www.histats.com" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://sstatic1.histats.com/0.gif?${histats}&101`}
                alt="Histats"
                width={1}
                height={1}
                style={{ border: 0 }}
              />
            </a>
          </noscript>
        </>
      ) : null}
    </>
  );
}
