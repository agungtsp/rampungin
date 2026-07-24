"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { VisibilityControls } from "@/components/VisibilityControls";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import { promptDetailPath } from "@/lib/paths";
import { applyVisibilityIntent } from "@/lib/visibility";
import {
  usesOptions,
  type PromptFieldInput,
  type PromptMode,
  type VisibilityIntent,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type Existing = {
  id: string;
  title: string;
  description: string | null;
  mode: PromptMode;
  body: string;
  category: string | null;
  tags: string[] | null;
  video_url: string | null;
  image_path: string | null;
  is_public: boolean;
  public_until: string | null;
  fields: PromptFieldInput[];
};

type Props = {
  existing?: Existing;
  authorUsername?: string;
};

function slugKey(label: string, index: number) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
  return base || `field_${index + 1}`;
}

export function PromptEditorForm({ existing, authorUsername }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [mode, setMode] = useState<PromptMode>(existing?.mode ?? "template");
  const [body, setBody] = useState(existing?.body ?? "");
  const [category, setCategory] = useState(
    existing?.category ?? DEFAULT_CATEGORY,
  );
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [videoUrl, setVideoUrl] = useState(existing?.video_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fields, setFields] = useState<PromptFieldInput[]>(
    existing?.fields?.length
      ? existing.fields
      : [
          {
            field_key: "topik",
            label: "Topik",
            field_type: "text",
            required: true,
            sort_order: 0,
            placeholder: "cth: marketing",
          },
        ],
  );
  const [intent, setIntent] = useState<VisibilityIntent>(() => {
    if (!existing) return { kind: "public" };
    if (!existing.is_public) return { kind: "private" };
    if (!existing.public_until) return { kind: "public" };
    const hours = Math.max(
      1,
      Math.round(
        (new Date(existing.public_until).getTime() - Date.now()) / 3600000,
      ),
    );
    return { kind: "timed", hours };
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function updateField(index: number, patch: Partial<PromptFieldInput>) {
    setFields((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        if (patch.label != null) next.field_key = slugKey(patch.label, index);
        return next;
      }),
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Silakan masuk terlebih dahulu");
      setBusy(false);
      return;
    }

    let visibility;
    try {
      visibility = applyVisibilityIntent(intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Visibilitas tidak valid");
      setBusy(false);
      return;
    }

    let imagePath = existing?.image_path ?? null;
    if (imageFile) {
      const okType = ["image/jpeg", "image/png", "image/webp"].includes(
        imageFile.type,
      );
      if (!okType) {
        setError("Gambar harus jpg/png/webp");
        setBusy(false);
        return;
      }
      if (imageFile.size > 2 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 2MB");
        setBusy(false);
        return;
      }
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("prompt-images")
        .upload(path, imageFile, { upsert: false });
      if (uploadError) {
        setError(
          `Upload gagal (${uploadError.message}). Prompt tetap bisa disimpan tanpa gambar baru.`,
        );
      } else {
        imagePath = path;
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      mode,
      body,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      video_url: videoUrl.trim() || null,
      image_path: imagePath,
      is_public: visibility.is_public,
      public_until: visibility.public_until
        ? visibility.public_until.toISOString()
        : null,
      updated_at: new Date().toISOString(),
    };

    let promptId = existing?.id;
    if (existing) {
      const { error: updateError } = await supabase
        .from("prompts")
        .update(payload)
        .eq("id", existing.id)
        .eq("author_id", user.id);
      if (updateError) {
        setError(updateError.message);
        setBusy(false);
        return;
      }
      await supabase.from("prompt_fields").delete().eq("prompt_id", existing.id);
    } else {
      const { data, error: insertError } = await supabase
        .from("prompts")
        .insert({ ...payload, author_id: user.id })
        .select("id")
        .single();
      if (insertError || !data) {
        setError(insertError?.message ?? "Gagal membuat prompt");
        setBusy(false);
        return;
      }
      promptId = data.id;
    }

    if (mode === "template" && promptId) {
      const rows = fields.map((f, i) => ({
        prompt_id: promptId,
        field_key: f.field_key || slugKey(f.label, i),
        label: f.label,
        field_type: f.field_type,
        required: f.required,
        options: usesOptions(f.field_type) ? f.options ?? [] : null,
        sort_order: i,
        placeholder: f.placeholder ?? null,
      }));
      const { error: fieldsError } = await supabase
        .from("prompt_fields")
        .insert(rows);
      if (fieldsError) {
        setError(fieldsError.message);
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    let username = authorUsername;
    if (!username) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      username = profile?.username ?? undefined;
    }
    if (username && promptId) {
      router.push(promptDetailPath(username, promptId));
    } else if (promptId) {
      router.push(`/prompts/${promptId}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-ink">
        {existing ? "Edit prompt" : "Buat prompt"}
      </h1>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Judul</span>
        <input
          required
          className="w-full rounded-lg border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Deskripsi</span>
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Kategori</span>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${mode === "template" ? "bg-primary-hover text-white" : "border"}`}
          onClick={() => setMode("template")}
        >
          Template berparameter
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${mode === "static" ? "bg-primary-hover text-white" : "border"}`}
          onClick={() => setMode("static")}
        >
          Prompt statis
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">
          {mode === "template"
            ? "Isi template (pakai {{field_key}})"
            : "Isi prompt"}
        </span>
        <textarea
          required
          className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            mode === "template"
              ? "Kamu adalah asisten untuk {{topik}}..."
              : "Tulis prompt siap pakai..."
          }
        />
      </label>

      {mode === "template" && (
        <div className="space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Parameter</p>
            <button
              type="button"
              className="text-sm text-primary-hover"
              onClick={() =>
                setFields((f) => [
                  ...f,
                  {
                    field_key: `field_${f.length + 1}`,
                    label: `Field ${f.length + 1}`,
                    field_type: "text",
                    required: false,
                    sort_order: f.length,
                  },
                ])
              }
            >
              + Tambah field
            </button>
          </div>
          {fields.map((f, i) => (
            <div key={i} className="grid gap-2 rounded-lg bg-soft/40 p-3 sm:grid-cols-2">
              <input
                className="rounded border px-2 py-1 text-sm"
                value={f.label}
                onChange={(e) => updateField(i, { label: e.target.value })}
                placeholder="Label"
              />
              <select
                className="rounded border px-2 py-1 text-sm"
                value={f.field_type}
                onChange={(e) =>
                  updateField(i, {
                    field_type: e.target.value as PromptFieldInput["field_type"],
                  })
                }
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="radio">Radio button</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateField(i, { required: e.target.checked })}
                />
                Wajib
              </label>
              <p className="text-xs text-ink/60">
                key: {`{{${f.field_key}}}`}
              </p>
              {usesOptions(f.field_type) && (
                <input
                  className="sm:col-span-2 rounded border px-2 py-1 text-sm"
                  placeholder="Opsi dipisah koma (cth: Formal, Santai, Lucu)"
                  value={(f.options ?? []).join(", ")}
                  onChange={(e) =>
                    updateField(i, {
                      options: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-sm font-medium">Tags (pisah koma)</span>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Preview gambar (jpg/png/webp, max 2MB)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">URL video (opsional)</span>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/..."
        />
      </label>

      <VisibilityControls value={intent} onChange={setIntent} />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-primary-hover px-5 py-3 text-white disabled:opacity-60"
      >
        {busy ? "Menyimpan…" : "Simpan prompt"}
      </button>
    </form>
  );
}
