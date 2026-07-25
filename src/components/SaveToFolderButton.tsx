"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/lib/i18n";
import { trackSavePrompt } from "@/lib/analytics";
import { localePath } from "@/lib/i18n/paths";
import { createClient } from "@/lib/supabase/client";

type Folder = {
  id: string;
  name: string;
  is_default: boolean;
};

type Props = {
  promptId: string;
  promptPath: string;
  isLoggedIn: boolean;
  /** Compact icon for cards */
  compact?: boolean;
};

export function SaveToFolderButton({
  promptId,
  promptPath,
  isLoggedIn: _isLoggedIn = false,
  compact = false,
}: Props) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedAnywhere, setSavedAnywhere] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function ensureAuth(): Promise<boolean> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return true;
    const next = encodeURIComponent(
      promptPath.startsWith("/id") || promptPath.startsWith("/en")
        ? promptPath
        : localePath(locale, promptPath),
    );
    window.location.assign(`${localePath(locale, "/auth")}?next=${next}`);
    return false;
  }

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setFolders([]);
      setSelected(new Set());
      setSavedAnywhere(false);
      return;
    }
    await supabase.rpc("ensure_default_save_folder");
    const { data: folderRows } = await supabase
      .from("save_folders")
      .select("id, name, is_default")
      .order("is_default", { ascending: false })
      .order("name");
    setFolders((folderRows as Folder[]) ?? []);

    const { data: saved } = await supabase
      .from("saved_prompts")
      .select("folder_id")
      .eq("prompt_id", promptId);
    const ids = new Set((saved ?? []).map((r) => r.folder_id as string));
    setSelected(ids);
    setSavedAnywhere(ids.size > 0);
  }

  // Bookmark state on mount only when logged in (avoids N× auth storms for guests)
  useEffect(() => {
    if (!_isLoggedIn) return;
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("saved_prompts")
        .select("folder_id")
        .eq("prompt_id", promptId)
        .limit(1);
      if (!cancelled) setSavedAnywhere((data?.length ?? 0) > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [promptId, _isLoggedIn]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load folder list when dialog opens
    void load();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on open/promptId only
  }, [open, promptId]);

  async function openPicker(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!(await ensureAuth())) return;
    setOpen(true);
    setMsg(null);
    void load();
  }

  async function toggleFolder(folderId: string) {
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
    const next = new Set(selected);
    if (next.has(folderId)) {
      const { error } = await supabase
        .from("saved_prompts")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId)
        .eq("folder_id", folderId);
      if (error) setMsg(error.message);
      else {
        next.delete(folderId);
        trackSavePrompt(promptId, "unsave");
      }
    } else {
      const { error } = await supabase.from("saved_prompts").insert({
        user_id: user.id,
        prompt_id: promptId,
        folder_id: folderId,
      });
      if (error) setMsg(error.message);
      else {
        next.add(folderId);
        trackSavePrompt(promptId, "save");
      }
    }
    setSelected(next);
    setSavedAnywhere(next.size > 0);
    setBusy(false);
  }

  async function createFolder(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { data, error } = await supabase
      .from("save_folders")
      .insert({ user_id: user.id, name, is_default: false })
      .select("id, name, is_default")
      .maybeSingle();
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    if (data) {
      setFolders((f) => [...f, data as Folder]);
      setNewName("");
    }
  }

  async function unsaveEverywhere() {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("saved_prompts")
      .delete()
      .eq("user_id", user.id)
      .eq("prompt_id", promptId);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setSelected(new Set());
    setSavedAnywhere(false);
  }

  const label = locale === "en" ? "Save" : "Simpan";
  const savedLabel = locale === "en" ? "Saved" : "Tersimpan";

  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-folder-title"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-card-hover"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2
                  id="save-folder-title"
                  className="font-display text-lg font-semibold text-ink"
                >
                  {locale === "en" ? "Save to folder" : "Simpan ke folder"}
                </h2>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-sm text-ink-muted hover:bg-soft"
                  onClick={() => setOpen(false)}
                  aria-label={locale === "en" ? "Close" : "Tutup"}
                  title={locale === "en" ? "Close" : "Tutup"}
                >
                  ✕
                </button>
              </div>

              <ul className="max-h-56 space-y-1 overflow-y-auto">
                {folders.map((f) => (
                  <li key={f.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-soft">
                      <input
                        type="checkbox"
                        checked={selected.has(f.id)}
                        disabled={busy}
                        onChange={() => void toggleFolder(f.id)}
                      />
                      <span className="text-sm font-medium text-ink">
                        {f.is_default
                          ? locale === "en"
                            ? "Uncategorized"
                            : "Tanpa kategori"
                          : f.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <form onSubmit={createFolder} className="mt-3 flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    locale === "en" ? "New folder name" : "Nama folder baru"
                  }
                  className="field-control min-w-0 flex-1 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={busy || !newName.trim()}
                  className="rounded-lg bg-soft px-3 py-2 text-sm font-medium text-ink hover:bg-secondary/40 disabled:opacity-50"
                >
                  {locale === "en" ? "Add" : "Tambah"}
                </button>
              </form>

              {savedAnywhere ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void unsaveEverywhere()}
                  className="mt-3 w-full rounded-lg py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {locale === "en"
                    ? "Remove from all folders"
                    : "Hapus dari semua folder"}
                </button>
              ) : null}

              {msg ? <p className="mt-2 text-xs text-red-600">{msg}</p> : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        title={savedAnywhere ? savedLabel : label}
        aria-label={savedAnywhere ? savedLabel : label}
        className={
          compact
            ? `rounded-md bg-white/95 p-1.5 shadow-sm ring-1 ring-black/5 transition hover:bg-white ${
                savedAnywhere ? "text-primary" : "text-ink-muted"
              }`
            : `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
                savedAnywhere
                  ? "bg-primary/10 text-primary ring-primary/30"
                  : "bg-white text-ink-muted ring-secondary/50 hover:bg-soft"
              }`
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={savedAnywhere ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
        </svg>
        {!compact ? (savedAnywhere ? savedLabel : label) : null}
      </button>
      {dialog}
    </>
  );
}
