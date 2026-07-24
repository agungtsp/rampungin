"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RampunginLogo } from "./RampunginLogo";
import { SmartSearchButton } from "./SmartSearchModal";

export function SiteHeader() {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setUsername(null);
        setReady(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setUsername(data?.username ?? null);
      setReady(true);
    }

    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-secondary/60 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" prefetch>
          <RampunginLogo className="h-8 w-8 shadow-sm transition group-hover:scale-[1.04]" />
          <span className="hidden font-display text-[1.05rem] font-semibold tracking-tight text-ink md:inline">
            Rampungin
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <SmartSearchButton variant="bar" />
        </div>

        <nav className="hidden items-center gap-1 text-sm font-medium text-ink-muted lg:flex">
          <Link
            href="/trending"
            prefetch
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Trending
          </Link>
          <Link
            href="/people"
            prefetch
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Kreator
          </Link>
          <Link
            href="/tutorial"
            prefetch
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Panduan
          </Link>
          <Link
            href="/about"
            prefetch
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Tentang
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/prompts/new"
            prefetch
            className="hidden rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover sm:inline-flex"
          >
            Buat prompt
          </Link>
          {!ready ? (
            <span
              className="inline-block h-9 w-16 animate-pulse rounded-full bg-soft"
              aria-hidden
            />
          ) : username ? (
            <Link
              href="/me"
              prefetch
              className="max-w-[7.5rem] truncate rounded-full bg-soft px-2.5 py-1.5 text-sm font-medium text-ink transition hover:bg-soft sm:max-w-none sm:px-3 sm:py-2"
            >
              @{username}
            </Link>
          ) : (
            <Link
              href="/auth"
              prefetch
              className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-hover sm:px-3.5 sm:py-2"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
