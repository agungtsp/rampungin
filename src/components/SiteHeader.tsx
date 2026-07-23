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
    <header className="sticky top-0 z-40 h-14 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <RampunginLogo className="h-8 w-8 shadow-sm transition group-hover:scale-[1.04]" />
          <span className="hidden font-display text-[1.05rem] font-semibold tracking-tight text-zinc-900 md:inline">
            Rampungin
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <SmartSearchButton variant="bar" />
        </div>

        <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-600 lg:flex">
          <Link
            href="/trending"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Trending
          </Link>
          <Link
            href="/people"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Profil
          </Link>
          <Link
            href="/tutorial"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Panduan
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Tentang
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/prompts/new"
            className="hidden rounded-full bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:inline-flex"
          >
            Buat prompt
          </Link>
          {user ? (
            <Link
              href="/me"
              className="max-w-[7.5rem] truncate rounded-full bg-zinc-100 px-2.5 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200 sm:max-w-none sm:px-3 sm:py-2"
            >
              {username ? `@${username}` : "Akun"}
            </Link>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-ink sm:px-3.5 sm:py-2"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
