"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { LocaleLink } from "./LocaleLink";

type Props = {
  username: string;
};

export function UserMenu({ username }: Props) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = localePath(locale, "/");
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={`@${username}`}
        aria-label={
          locale === "en" ? `Account menu for @${username}` : `Menu akun @${username}`
        }
        className="max-w-[7.5rem] truncate rounded-full bg-soft px-2.5 py-1.5 text-sm font-medium text-ink transition hover:bg-soft sm:max-w-none sm:px-3 sm:py-2"
      >
        @{username}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl bg-white py-1 shadow-card-hover ring-1 ring-secondary/50"
        >
          <LocaleLink
            role="menuitem"
            href="/me"
            prefetch
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink transition hover:bg-soft"
          >
            {t("editProfile")}
          </LocaleLink>
          <LocaleLink
            role="menuitem"
            href="/saved"
            prefetch
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink transition hover:bg-soft"
          >
            {t("navSaved")}
          </LocaleLink>
          <button
            role="menuitem"
            type="button"
            onClick={() => void logout()}
            className="block w-full px-3.5 py-2 text-left text-sm text-ink transition hover:bg-soft"
          >
            {t("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
