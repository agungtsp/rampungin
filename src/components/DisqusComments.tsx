"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Stable thread id — use prompt UUID */
  identifier: string;
  /** Canonical page URL */
  url: string;
  title?: string;
};

declare global {
  interface Window {
    DISQUS?: {
      reset: (opts: {
        reload: boolean;
        config: () => void;
      }) => void;
    };
    disqus_config?: () => void;
  }
}

/** Accept shortname, or common mistakes like "foo.disqus.com" / full embed URL. */
function normalizeDisqusShortname(raw: string | undefined): string {
  let s = (raw ?? "").trim();
  if (!s) return "";
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/\/embed\.js$/i, "");
  s = s.replace(/\.disqus\.com.*$/i, "");
  s = s.replace(/\/+$/, "");
  return s.trim();
}

export function DisqusComments({ identifier, url, title }: Props) {
  const shortname = normalizeDisqusShortname(
    process.env.NEXT_PUBLIC_DISQUS_SHORTNAME,
  );
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!shortname || typeof window === "undefined") return;

    const absoluteUrl = url.startsWith("http")
      ? url
      : `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;

    window.disqus_config = function disqusConfig() {
      // @ts-expect-error Disqus injects this
      this.page.identifier = identifier;
      // @ts-expect-error Disqus injects this
      this.page.url = absoluteUrl;
      // @ts-expect-error Disqus injects this
      this.page.title = title || document.title;
    };

    const scriptId = "disqus-embed-script";
    const existing = document.getElementById(scriptId);

    if (window.DISQUS && loadedFor.current) {
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });
      loadedFor.current = identifier;
      return;
    }

    if (!existing) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://${shortname}.disqus.com/embed.js`;
      script.setAttribute("data-timestamp", String(Date.now()));
      script.async = true;
      document.body.appendChild(script);
    } else if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });
    }
    loadedFor.current = identifier;
  }, [identifier, url, title, shortname]);

  if (!shortname) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Komentar Disqus belum dikonfigurasi. Set{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_DISQUS_SHORTNAME</code>{" "}
        ke shortname saja (contoh:{" "}
        <code className="rounded bg-amber-100 px-1">rampungin</code>, bukan{" "}
        <code className="rounded bg-amber-100 px-1">rampungin.disqus.com</code>
        ) di <code className="rounded bg-amber-100 px-1">.env</code>, lalu
        restart <code className="rounded bg-amber-100 px-1">npm run dev</code>.
      </div>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.07] sm:p-5">
      <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
        Komentar
      </h2>
      <div id="disqus_thread" />
      <noscript>
        Aktifkan JavaScript untuk melihat komentar dari{" "}
        <a href="https://disqus.com/?ref_noscript">Disqus</a>.
      </noscript>
    </section>
  );
}
