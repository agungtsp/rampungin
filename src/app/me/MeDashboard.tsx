"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import { FileUploadField } from "@/components/FileUploadField";
import { SocialLinks } from "@/components/SocialLinks";
import { useLocale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import {
  SOCIAL_PLATFORMS,
  normalizeSocialUrl,
  type SocialLinksData,
} from "@/lib/social";
import { publicImageUrl, resolveAvatarUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialUsername: string;
  initialDisplayName: string;
  initialBio: string;
  initialAvatarUrl: string | null;
  initialSocials: SocialLinksData;
};

export function MeDashboard({
  initialUsername,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
  initialSocials,
}: Props) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [socials, setSocials] = useState({
    threads_url: initialSocials.threads_url ?? "",
    instagram_url: initialSocials.instagram_url ?? "",
    youtube_url: initialSocials.youtube_url ?? "",
    linkedin_url: initialSocials.linkedin_url ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileOk, setProfileOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function setSocial(column: keyof typeof socials, value: string) {
    setSocials((s) => ({ ...s, [column]: value }));
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setProfileError(null);
    setProfileOk(null);
    setMessage(null);

    const nextUsername = username.toLowerCase().trim();
    const nextDisplayName = displayName.trim();
    const nextBio = bio.trim();

    if (!nextUsername || !nextDisplayName || !nextBio) {
      setProfileError(
        locale === "en"
          ? "Username, full name, and bio are required."
          : "Username, Fullname, dan bio wajib diisi.",
      );
      setBusy(false);
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(nextUsername)) {
      setProfileError(
        locale === "en"
          ? "Username must be 3–30 characters: lowercase letters, numbers, or underscore."
          : "Username harus 3–30 karakter: huruf kecil, angka, atau underscore.",
      );
      setBusy(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfileError("Sesi berakhir. Silakan masuk lagi.");
      setBusy(false);
      return;
    }

    if (nextUsername !== initialUsername.toLowerCase().trim()) {
      const { data: taken, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", nextUsername)
        .neq("id", user.id)
        .maybeSingle();
      if (checkError) {
        setProfileError(checkError.message);
        setBusy(false);
        return;
      }
      if (taken) {
        setProfileError(
          "Username sudah dipakai. Silakan pilih username lain.",
        );
        setBusy(false);
        return;
      }
    }

    let nextAvatar = avatarUrl;
    if (avatarFile) {
      const okType = ["image/jpeg", "image/png", "image/webp"].includes(
        avatarFile.type,
      );
      if (!okType) {
        setProfileError("Foto harus jpg/png/webp");
        setBusy(false);
        return;
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        setProfileError("Ukuran foto maksimal 2MB");
        setBusy(false);
        return;
      }
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("prompt-images")
        .upload(path, avatarFile, { upsert: false });
      if (uploadError) {
        setProfileError(`Upload foto gagal: ${uploadError.message}`);
        setBusy(false);
        return;
      }
      nextAvatar = publicImageUrl(path);
      setAvatarUrl(nextAvatar);
      setAvatarFile(null);
    }

    const payload = {
      username: nextUsername,
      display_name: nextDisplayName,
      bio: nextBio,
      avatar_url: nextAvatar,
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
      const isUsernameTaken =
        error.code === "23505" ||
        error.message.includes("profiles_username_key") ||
        error.message.toLowerCase().includes("duplicate key");
      if (isUsernameTaken) {
        setProfileError(
          "Username sudah dipakai. Silakan pilih username lain.",
        );
        return;
      }
      const hint = error.message.includes("threads_url")
        ? " (jalankan migrasi social links di Supabase dulu)"
        : "";
      setProfileError(error.message + hint);
      return;
    }
    setProfileOk(
      locale === "en" ? "Profile saved successfully" : "Profil berhasil disimpan",
    );
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
    window.location.href = localePath(locale, "/");
  }

  const inputClass =
    "field-control w-full rounded-lg bg-white text-ink px-3 py-2 text-sm outline-none";

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">{t("accountTitle")}</h1>
        <LocaleLink
          href="/my-prompts"
          className="text-sm font-semibold text-primary-hover underline"
        >
          {t("myPrompts")} →
        </LocaleLink>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-5 rounded-2xl border border-primary/10 bg-white p-5 shadow-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Edit profil</h2>
            <p className="text-sm text-ink/60">
              Nama, bio, foto, dan tautan media sosial yang tampil di halaman
              publik.
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

        <FileUploadField
          label="Foto profil"
          buttonLabel="Pilih foto"
          hint="jpg/png/webp, maks. 2MB"
          showPreview
          previewUrl={resolveAvatarUrl(avatarUrl)}
          previewAlt={`Foto profil ${displayName || username || ""}`.trim()}
          fileName={avatarFile?.name}
          onChange={(file) => {
            setAvatarFile(file);
            setProfileError(null);
          }}
        />

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Username <span className="text-rose-600">*</span>
          </span>
          <input
            className={inputClass}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setProfileError(null);
            }}
            placeholder="username"
            pattern="[a-z0-9_]{3,30}"
            title="3–30 karakter: a-z, 0-9, underscore"
            required
            minLength={3}
            maxLength={30}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Fullname <span className="text-rose-600">*</span>
          </span>
          <input
            className={inputClass}
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setProfileError(null);
            }}
            placeholder="Fullname"
            required
            minLength={1}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Bio <span className="text-rose-600">*</span>
          </span>
          <textarea
            className={inputClass}
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setProfileError(null);
            }}
            placeholder="Ceritakan singkat tentang dirimu"
            rows={3}
            required
            minLength={1}
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

        <div className="space-y-3">
          {profileError ? (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200"
            >
              {profileError}
            </p>
          ) : null}
          {profileOk ? (
            <p className="rounded-lg bg-soft px-3 py-2 text-sm text-ink ring-1 ring-primary/20">
              {profileOk}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              title={busy ? t("saving") : t("saveProfile")}
              className="rounded-lg bg-primary-hover px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
            >
              {busy ? t("saving") : t("saveProfile")}
            </button>
            <LocaleLink
              href={`/profile/${username}`}
              title="Lihat halaman publik"
              className="text-sm text-primary-hover underline"
            >
              Lihat halaman publik →
            </LocaleLink>
          </div>
        </div>
      </form>

      <section className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="font-semibold text-red-900">
          {locale === "en" ? "Delete account" : "Hapus akun"}
        </h2>
        <p className="text-sm text-red-800">
          {locale === "en" ? (
            <>
              Deletes your account, prompts, likes, comments, follows, and image
              files. Type <strong>DELETE</strong> or <strong>HAPUS</strong> to
              confirm.
            </>
          ) : (
            <>
              Menghapus akun, prompt, suka, komentar, mengikuti, dan file gambar.
              Ketik <strong>HAPUS</strong> atau <strong>DELETE</strong> untuk
              mengonfirmasi.
            </>
          )}
        </p>
        <input
          className="field-control w-full rounded-lg px-3 py-2"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
        />
        <button
          type="button"
          onClick={deleteAccount}
          className="rounded-lg bg-red-700 px-4 py-2 text-white"
        >
          {locale === "en" ? "Permanently delete account" : "Hapus akun permanen"}
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
