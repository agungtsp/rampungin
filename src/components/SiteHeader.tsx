"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleLink } from "./LocaleLink";
import { RampunginLogo } from "./RampunginLogo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserMenu } from "./UserMenu";

const SmartSearchButton = dynamic(
  () =>
    import("./SmartSearchModal").then((m) => ({
      default: m.SmartSearchButton,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-9 w-full max-w-md animate-pulse rounded-full bg-soft"
        aria-hidden
      />
    ),
  },
);

const navLinkClass =
  "whitespace-nowrap rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink";

type Props = {
  initialUsername?: string | null;
};

export function SiteHeader({ initialUsername = null }: Props) {
  const { t } = useLocale();
  const [username, setUsername] = useState<string | null>(initialUsername);
  const [ready, setReady] = useState(initialUsername !== undefined);

  useEffect(() => {
    setUsername(initialUsername);
    setReady(true);
  }, [initialUsername]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setUsername(null);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setUsername(null);
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();
        setUsername(data?.username ?? null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = (
    <>
      <LocaleLink href="/trending" prefetch className={navLinkClass}>
        {t("navTrending")}
      </LocaleLink>
      <LocaleLink href="/people" prefetch className={navLinkClass}>
        {t("navCreators")}
      </LocaleLink>
      {username ? (
        <LocaleLink href="/saved" prefetch className={navLinkClass}>
          {t("navSaved")}
        </LocaleLink>
      ) : null}
      <LocaleLink href="/tutorial" prefetch className={navLinkClass}>
        {t("navGuide")}
      </LocaleLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/60 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <LocaleLink
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          prefetch
          title="Rampungin — Home"
          aria-label="Rampungin home"
        >
          <RampunginLogo className="h-8 w-8 shadow-sm transition group-hover:scale-[1.04]" />
          <span className="hidden font-display text-[1.05rem] font-semibold tracking-tight text-ink sm:inline">
            Rampungin
          </span>
        </LocaleLink>

        <div className="min-w-0 flex-1">
          <SmartSearchButton variant="bar" />
        </div>

        <nav className="hidden items-center gap-0.5 text-sm font-medium text-ink-muted xl:flex">
          {navLinks}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <LocaleLink
            href={username ? "/my-prompts" : "/prompts/new"}
            prefetch
            className="hidden rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover md:inline-flex"
          >
            {username ? t("myPrompts") : t("navCreate")}
          </LocaleLink>
          {!ready ? (
            <span
              className="inline-block h-9 w-16 animate-pulse rounded-full bg-soft"
              aria-hidden
            />
          ) : username ? (
            <UserMenu username={username} />
          ) : (
            <LocaleLink
              href="/auth"
              prefetch
              className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-hover sm:px-3.5 sm:py-2"
            >
              {t("navLogin")}
            </LocaleLink>
          )}
        </div>
      </div>

      <nav
        aria-label="Main"
        className="-mx-0 flex items-center gap-0.5 overflow-x-auto border-t border-secondary/40 px-3 py-1.5 text-sm font-medium text-ink-muted [scrollbar-width:none] sm:px-6 xl:hidden [&::-webkit-scrollbar]:hidden"
      >
        {navLinks}
        <LocaleLink
          href={username ? "/my-prompts" : "/prompts/new"}
          prefetch
          className="ml-auto whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary-hover md:hidden"
        >
          {username ? t("myPrompts") : t("navCreate")}
        </LocaleLink>
      </nav>
    </header>
  );
}
