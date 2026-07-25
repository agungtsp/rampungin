import Script from "next/script";

function gaId(): string {
  return (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
}

function histatsId(): string {
  return (process.env.NEXT_PUBLIC_HISTATS_ID ?? "").trim();
}

/** Google Analytics 4 (gtag.js) + Histats — only load when env IDs are set. */
export function SiteAnalytics() {
  const ga = gaId();
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
              gtag('js', new Date());
              gtag('config', '${ga}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {histats ? (
        <>
          {/* Histats.com START */}
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
          {/* Histats.com END */}
        </>
      ) : null}
    </>
  );
}
