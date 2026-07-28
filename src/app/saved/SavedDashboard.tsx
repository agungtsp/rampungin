"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocale } from "@/lib/i18n";
import { promptDetailPath } from "@/lib/paths";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
import { createClient } from "@/lib/supabase/client";
import { publicImageUrl } from "@/lib/storage";

type Folder = {
  id: string;
  name: string;
  is_default: boolean;
};

type SavedItem = {
  folder_id: string;
  created_at: string;
  prompt: {
    id: string;
    title: string;
    title_en?: string | null;
    image_path?: string | null;
    image_path_en?: string | null;
    profiles?: { username: string } | { username: string }[] | null;
  } | null;
};

function authorUsername(
  profiles: SavedItem["prompt"] extends null
    ? never
    : NonNullable<SavedItem["prompt"]>["profiles"],
): string | undefined {
  return asOne(profiles)?.username;
}

export function SavedDashboard() {
  const { locale } = useLocale();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    const supabase = createClient();
    await supabase.rpc("ensure_default_save_folder");
    const { data } = await supabase
      .from("save_folders")
      .select("id, name, is_default")
      .order("is_default", { ascending: false })
      .order("name");
    const rows = (data as Folder[]) ?? [];
    setFolders(rows);
    setActiveFolder((prev) => {
      if (prev && rows.some((f) => f.id === prev)) return prev;
      return rows.find((f) => f.is_default)?.id ?? rows[0]?.id ?? null;
    });
  }, []);

  const loadItems = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setItems([]);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("saved_prompts")
      .select(
        `folder_id, created_at, prompt:prompts(id, title, title_en, image_path, image_path_en, ${PROMPT_AUTHOR})`,
      )
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false });
    if (error) {
      setMsg(error.message);
      setItems([]);
      return;
    }
    setItems((data as unknown as SavedItem[]) ?? []);
  }, []);

  useEffect(() => {
    // Legitimate data fetch on mount / folder change
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loaders update list state
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loaders update list state
    void loadItems(activeFolder);
  }, [activeFolder, loadItems]);

  async function createFolder(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("save_folders")
      .insert({ user_id: user.id, name, is_default: false });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setNewName("");
    await loadFolders();
  }

  async function renameFolder(e: FormEvent) {
    e.preventDefault();
    if (!renameId || !renameValue.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("save_folders")
      .update({ name: renameValue.trim() })
      .eq("id", renameId);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setRenameId(null);
    await loadFolders();
  }

  async function deleteFolder(folder: Folder) {
    if (folder.is_default) return;
    const ok = window.confirm(
      locale === "en"
        ? "Delete this folder? Prompts will move to Uncategorized."
        : "Hapus folder ini? Prompt akan dipindah ke Tanpa kategori.",
    );
    if (!ok) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { data: defaultId } = await supabase.rpc("ensure_default_save_folder");
    const unc = defaultId as string;

    const { data: memberships } = await supabase
      .from("saved_prompts")
      .select("prompt_id")
      .eq("folder_id", folder.id)
      .eq("user_id", user.id);

    for (const row of memberships ?? []) {
      const pid = row.prompt_id as string;
      await supabase.from("saved_prompts").upsert(
        {
          user_id: user.id,
          prompt_id: pid,
          folder_id: unc,
        },
        { onConflict: "user_id,prompt_id,folder_id" },
      );
    }
    await supabase
      .from("saved_prompts")
      .delete()
      .eq("folder_id", folder.id)
      .eq("user_id", user.id);
    const { error } = await supabase
      .from("save_folders")
      .delete()
      .eq("id", folder.id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    await loadFolders();
  }

  async function removeFromFolder(promptId: string, folderId: string) {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    await supabase
      .from("saved_prompts")
      .delete()
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .eq("folder_id", folderId);
    setBusy(false);
    await loadItems(folderId);
  }

  async function unsaveEverywhere(promptId: string) {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    await supabase
      .from("saved_prompts")
      .delete()
      .eq("user_id", user.id)
      .eq("prompt_id", promptId);
    setBusy(false);
    await loadItems(activeFolder);
  }

  const folderLabel = (f: Folder) =>
    f.is_default
      ? locale === "en"
        ? "Uncategorized"
        : "Tanpa kategori"
      : f.name;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {locale === "en" ? "Saved prompts" : "Prompt tersimpan"}
        </h1>
        <p className="text-sm text-ink-muted">
          {locale === "en"
            ? "Organize bookmarks into folders. Remove from a folder or unsave everywhere."
            : "Atur bookmark ke dalam folder. Hapus dari folder atau hapus dari semua folder."}
        </p>
      </header>

      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-3">
          <ul className="space-y-1">
            {folders.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setActiveFolder(f.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                    activeFolder === f.id
                      ? "bg-primary text-white"
                      : "bg-white text-ink ring-1 ring-secondary/50 hover:bg-soft"
                  }`}
                >
                  {folderLabel(f)}
                </button>
                {!f.is_default && activeFolder === f.id ? (
                  <div className="mt-1 flex gap-2 px-1">
                    <button
                      type="button"
                      className="text-xs text-ink-muted underline"
                      onClick={() => {
                        setRenameId(f.id);
                        setRenameValue(f.name);
                      }}
                    >
                      {locale === "en" ? "Rename" : "Ubah nama"}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 underline"
                      disabled={busy}
                      onClick={() => void deleteFolder(f)}
                    >
                      {locale === "en" ? "Delete" : "Hapus"}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <form onSubmit={createFolder} className="space-y-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={
                locale === "en" ? "New folder" : "Folder baru"
              }
              className="field-control w-full rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !newName.trim()}
              className="w-full rounded-full bg-soft py-2 text-sm font-semibold text-ink ring-1 ring-secondary/50 disabled:opacity-50"
            >
              {locale === "en" ? "Create folder" : "Buat folder"}
            </button>
          </form>

          {renameId ? (
            <form onSubmit={renameFolder} className="space-y-2 rounded-xl bg-soft p-3">
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="field-control w-full rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {locale === "en" ? "Save" : "Simpan"}
                </button>
                <button
                  type="button"
                  className="text-xs text-ink-muted"
                  onClick={() => setRenameId(null)}
                >
                  {locale === "en" ? "Cancel" : "Batal"}
                </button>
              </div>
            </form>
          ) : null}
        </aside>

        <section className="space-y-3">
          {!items.length ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-muted ring-1 ring-secondary/50">
              {locale === "en"
                ? "No prompts in this folder yet. Use the bookmark icon on a prompt card."
                : "Belum ada prompt di folder ini. Gunakan ikon bookmark pada kartu prompt."}
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => {
                const prompt = item.prompt;
                if (!prompt) return null;
                const uname = authorUsername(prompt.profiles);
                const title =
                  locale === "en"
                    ? prompt.title_en?.trim() || prompt.title
                    : prompt.title?.trim() || prompt.title_en?.trim() || "";
                const coverPath =
                  locale === "en"
                    ? prompt.image_path_en || prompt.image_path
                    : prompt.image_path || prompt.image_path_en;
                const cover = publicImageUrl(coverPath ?? null);
                const href = uname
                  ? promptDetailPath(uname, prompt.id)
                  : `/prompts/${prompt.id}`;
                return (
                  <li
                    key={`${item.folder_id}-${prompt.id}`}
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-secondary/50"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-soft">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={title}
                          title={title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <LocaleLink
                        href={href}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {title}
                      </LocaleLink>
                      {uname ? (
                        <p className="text-xs text-ink-muted">@{uname}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void removeFromFolder(prompt.id, item.folder_id)
                        }
                        title={
                          locale === "en"
                            ? "Remove from folder"
                            : "Hapus dari folder"
                        }
                        aria-label={
                          locale === "en"
                            ? "Remove from folder"
                            : "Hapus dari folder"
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink ring-1 ring-secondary/50 hover:bg-soft disabled:opacity-50"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4H8l1.5 1.5H16.5A1.5 1.5 0 0 1 18 7v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9Z" />
                          <path
                            fillRule="evenodd"
                            d="M12.78 8.22a.75.75 0 0 1 0 1.06L11.06 11l1.72 1.72a.75.75 0 1 1-1.06 1.06L10 12.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L8.94 11 7.22 9.28a.75.75 0 0 1 1.06-1.06L10 9.94l1.72-1.72a.75.75 0 0 1 1.06 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void unsaveEverywhere(prompt.id)}
                        title={locale === "en" ? "Unsave all" : "Hapus semua"}
                        aria-label={
                          locale === "en" ? "Unsave all" : "Hapus semua"
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.5 3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4H16a1 1 0 1 1 0 2h-.292l-.7 9.1A2 2 0 0 1 13.017 17H6.983a2 2 0 0 1-1.991-1.9L4.292 6H4a1 1 0 0 1 0-2h3.5V3Zm1.5 1h2V3.5h-2V4Zm-2.2 2 .66 8.58a.5.5 0 0 0 .498.42h6.084a.5.5 0 0 0 .498-.42L13.2 6H6.8Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
