"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { VisibilityControls } from "@/components/VisibilityControls";
import { SocialLinks } from "@/components/SocialLinks";
import { promptDetailPath, promptEditPath } from "@/lib/paths";
import { applyVisibilityIntent } from "@/lib/visibility";
import { isEffectivelyPublic } from "@/lib/visibility";
import {
  SOCIAL_PLATFORMS,
  normalizeSocialUrl,
  type SocialLinksData,
} from "@/lib/social";
import type { VisibilityIntent } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type PromptRow = {
  id: string;
  title: string;
  is_public: boolean;
  public_until: string | null;
  mode: string;
};

type Props = {
  initialUsername: string;
  initialDisplayName: string;
  initialBio: string;
  initialSocials: SocialLinksData;
  prompts: PromptRow[];
};

export function MeDashboard({
  initialUsername,
  initialDisplayName,
  initialBio,
  initialSocials,
  prompts,
}: Props) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [socials, setSocials] = useState({
    threads_url: initialSocials.threads_url ?? "",
    instagram_url: initialSocials.instagram_url ?? "",
    youtube_url: initialSocials.youtube_url ?? "",
    linkedin_url: initialSocials.linkedin_url ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [intents, setIntents] = useState<Record<string, VisibilityIntent>>({});

  function setSocial(column: keyof typeof socials, value: string) {
    setSocials((s) => ({ ...s, [column]: value }));
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }

    const payload = {
      username: username.toLowerCase().trim(),
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      threads_url: normalizeSocialUrl(socials.threads_url) || null,
      instagram_url: normalizeSocialUrl(socials.instagram_url) || null,
      youtube_url: normalizeSocialUrl(socials.youtube_url) || null,
      linkedin_url: normalizeSocialUrl(socials.linkedin_url) || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    setBusy(false);
    if (error) {
      const hint = error.message.includes("threads_url")
        ? " (jalankan migrasi social links di Supabase dulu)"
        : "";
      setMessage(error.message + hint);
      return;
    }
    setMessage("Profil disimpan");
    router.refresh();
  }

  async function applyVisibility(promptId: string) {
    const intent = intents[promptId];
    if (!intent) return;
    let visibility;
    try {
      visibility = applyVisibilityIntent(intent);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Invalid");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("prompts")
      .update({
        is_public: visibility.is_public,
        public_until: visibility.public_until
          ? visibility.public_until.toISOString()
          : null,
      })
      .eq("id", promptId);
    setMessage(error ? error.message : "Visibilitas diperbarui");
    router.refresh();
  }

  async function deleteAccount() {
    if (deleteConfirm !== "HAPUS" && deleteConfirm !== "DELETE") {
      setMessage("Ketik HAPUS atau DELETE untuk konfirmasi");
      return;
    }
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Gagal menghapus akun");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const inputClass =
    "w-full rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">Akun saya</h1>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-primary-hover underline"
        >
          Keluar
        </button>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-5 rounded-2xl border border-primary/10 bg-white p-5 shadow-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Edit profil</h2>
            <p className="text-sm text-ink/60">
              Nama, bio, dan tautan media sosial yang tampil di halaman publik.
            </p>
          </div>
          <SocialLinks
            profile={{
              threads_url: socials.threads_url || null,
              instagram_url: socials.instagram_url || null,
              youtube_url: socials.youtube_url || null,
              linkedin_url: socials.linkedin_url || null,
            }}
            size="sm"
          />
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Username</span>
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            pattern="[a-z0-9_]{3,30}"
            title="3–30 karakter: a-z, 0-9, underscore"
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Nama tampilan</span>
          <input
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nama tampilan"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Bio</span>
          <textarea
            className={inputClass}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan singkat tentang dirimu"
            rows={3}
          />
        </label>

        <div className="space-y-3 rounded-xl border border-primary/10 bg-soft/40 p-4">
          <h3 className="text-sm font-semibold text-ink">
            Media sosial
          </h3>
          <p className="text-xs text-ink/60">
            Isi URL lengkap atau domain saja — akan dinormalisasi ke https.
          </p>
          {SOCIAL_PLATFORMS.map((p) => (
            <label key={p.key} className="block space-y-1">
              <span className="text-sm font-medium">{p.label}</span>
              <input
                className={inputClass}
                type="text"
                inputMode="url"
                value={socials[p.column]}
                onChange={(e) => setSocial(p.column, e.target.value)}
                placeholder={p.placeholder}
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-primary-hover px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? "Menyimpan…" : "Simpan profil"}
          </button>
          <Link
            href={`/profile/${username}`}
            className="text-sm text-primary-hover underline"
          >
            Lihat halaman publik →
          </Link>
        </div>
      </form>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Prompt saya</h2>
          <Link href="/prompts/new" className="text-sm text-primary-hover underline">
            Buat baru
          </Link>
        </div>
        {prompts.map((p) => {
          const pub = isEffectivelyPublic(p.is_public, p.public_until);
          const badge = !p.is_public
            ? "Privat"
            : p.public_until
              ? pub
                ? "Publik terbatas"
                : "Kedaluwarsa"
              : "Publik";
          return (
            <div
              key={p.id}
              className="space-y-3 rounded-xl border border-primary/10 bg-white p-4 shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={promptDetailPath(username, p.id)}
                    className="font-medium underline"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-ink/60">
                    {p.mode} · {badge}
                  </p>
                </div>
                <Link
                  href={promptEditPath(username, p.id)}
                  className="text-sm underline"
                >
                  Edit
                </Link>
              </div>
              <VisibilityControls
                value={
                  intents[p.id] ??
                  (!p.is_public
                    ? { kind: "private" }
                    : p.public_until
                      ? { kind: "timed", hours: 24 }
                      : { kind: "public" })
                }
                onChange={(intent) =>
                  setIntents((m) => ({ ...m, [p.id]: intent }))
                }
              />
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm"
                onClick={() => applyVisibility(p.id)}
              >
                Terapkan visibilitas
              </button>
            </div>
          );
        })}
      </section>

      <section className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="font-semibold text-red-900">Hapus akun</h2>
        <p className="text-sm text-red-800">
          Menghapus akun, prompt, like, komentar, follow, dan file gambar. Ketik{" "}
          <strong>HAPUS</strong> atau <strong>DELETE</strong>.
        </p>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
        />
        <button
          type="button"
          onClick={deleteAccount}
          className="rounded-lg bg-red-700 px-4 py-2 text-white"
        >
          Hapus akun permanen
        </button>
      </section>

      {message && (
        <p className="rounded-lg bg-soft px-3 py-2 text-sm text-ink">
          {message}
        </p>
      )}
    </div>
  );
}
