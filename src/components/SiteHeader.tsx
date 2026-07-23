import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RampunginLogo } from "./RampunginLogo";
import { SmartSearchButton } from "./SmartSearchModal";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-secondary/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
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
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Trending
          </Link>
          <Link
            href="/people"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Profil
          </Link>
          <Link
            href="/tutorial"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Panduan
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-soft hover:text-ink"
          >
            Tentang
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/prompts/new"
            className="hidden rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover sm:inline-flex"
          >
            Buat prompt
          </Link>
          {user ? (
            <Link
              href="/me"
              className="max-w-[7.5rem] truncate rounded-full bg-soft px-2.5 py-1.5 text-sm font-medium text-ink transition hover:bg-soft sm:max-w-none sm:px-3 sm:py-2"
            >
              {username ? `@${username}` : "Akun"}
            </Link>
          ) : (
            <Link
              href="/auth"
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
