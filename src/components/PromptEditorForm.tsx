"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { VisibilityControls } from "@/components/VisibilityControls";
import { TermsAcceptance } from "@/components/TermsAcceptance";
import { FileUploadField } from "@/components/FileUploadField";
import { CATEGORIES, DEFAULT_CATEGORY, categoryLabel } from "@/lib/categories";
import { publicImageUrl } from "@/lib/storage";
import {
  AI_PLATFORMS,
  parseAiPlatform,
  type AiPlatform,
} from "@/lib/ai-platform";
import { useLocale } from "@/lib/i18n";
import { isAvailableInLocale } from "@/lib/i18n/prompt";
import { localePath } from "@/lib/i18n/paths";
import { promptDetailPath } from "@/lib/paths";
import {
  defaultUsageGuidePlaceholder,
  defaultUsageGuideText,
} from "@/lib/usage-guide";
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
  title_en?: string | null;
  description_en?: string | null;
  body_en?: string | null;
  tags_en?: string[] | null;
  video_url: string | null;
  image_path: string | null;
  image_path_en?: string | null;
  ai_platform?: AiPlatform | string | null;
  usage_guide?: string | null;
  usage_guide_en?: string | null;
  is_public: boolean;
  public_until: string | null;
  fields: PromptFieldInput[];
};

type Props = {
  existing?: Existing;
  authorUsername?: string;
};

type ContentLang = "id" | "en";

function slugKey(label: string, index: number) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
  return base || `field_${index + 1}`;
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function PromptEditorForm({ existing, authorUsername }: Props) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [contentLang, setContentLang] = useState<ContentLang>(locale);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [titleEn, setTitleEn] = useState(existing?.title_en ?? "");
  const [descriptionEn, setDescriptionEn] = useState(
    existing?.description_en ?? "",
  );
  const [bodyEn, setBodyEn] = useState(existing?.body_en ?? "");
  const [tagsEn, setTagsEn] = useState((existing?.tags_en ?? []).join(", "));
  const [mode, setMode] = useState<PromptMode>(existing?.mode ?? "template");
  const [category, setCategory] = useState(
    existing?.category ?? DEFAULT_CATEGORY,
  );
  const [videoUrl, setVideoUrl] = useState(existing?.video_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileEn, setImageFileEn] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState(existing?.image_path ?? null);
  const [imagePathEn, setImagePathEn] = useState(
    existing?.image_path_en ?? null,
  );
  const [aiPlatform, setAiPlatform] = useState<AiPlatform>(
    parseAiPlatform(existing?.ai_platform),
  );
  const [usageGuide, setUsageGuide] = useState(existing?.usage_guide ?? "");
  const [usageGuideEn, setUsageGuideEn] = useState(
    existing?.usage_guide_en ?? "",
  );
  const [fields, setFields] = useState<PromptFieldInput[]>(
    existing?.fields?.length
      ? existing.fields
      : [
          {
            field_key: locale === "en" ? "topic" : "topik",
            label: locale === "en" ? "Topic" : "Topik",
            field_type: "text",
            required: true,
            sort_order: 0,
            placeholder: locale === "en" ? "e.g. marketing" : "cth: marketing",
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
  const [acceptedTerms, setAcceptedTerms] = useState(Boolean(existing));

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
    if (!acceptedTerms) {
      setError(
        locale === "en"
          ? "You must accept the Terms & Conditions to publish a prompt."
          : "Anda harus menyetujui Syarat & Ketentuan untuk mempublikasikan prompt.",
      );
      setBusy(false);
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t("editorNeedLogin"));
      setBusy(false);
      return;
    }
    const userId = user.id;

    const draft = {
      title: title.trim(),
      description: description.trim() || null,
      body: body.trim(),
      tags: parseTags(tags),
      title_en: titleEn.trim() || null,
      description_en: descriptionEn.trim() || null,
      body_en: bodyEn.trim() || null,
      tags_en: parseTags(tagsEn),
    };

    const okId = isAvailableInLocale(draft, "id");
    const okEn = isAvailableInLocale(draft, "en");
    if (!okId && !okEn) {
      setError(t("editorNeedOneLang"));
      setBusy(false);
      return;
    }

    let visibility;
    try {
      visibility = applyVisibilityIntent(intent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("editorInvalidVisibility"),
      );
      setBusy(false);
      return;
    }

    let nextImagePath = imagePath;
    let nextImagePathEn = imagePathEn;

    async function uploadCover(file: File): Promise<string | null> {
      const okType = ["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      );
      if (!okType) {
        setError(t("editorImageType"));
        return null;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError(t("editorImageSize"));
        return null;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("prompt-images")
        .upload(path, file, { upsert: false });
      if (uploadError) {
        setError(
          locale === "en"
            ? `Upload failed (${uploadError.message}). Prompt can still be saved without a new image.`
            : `Upload gagal (${uploadError.message}). Prompt tetap bisa disimpan tanpa gambar baru.`,
        );
        return null;
      }
      return path;
    }

    if (imageFile) {
      const path = await uploadCover(imageFile);
      if (path) {
        nextImagePath = path;
        setImagePath(path);
      } else if (
        imageFile.type &&
        !["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)
      ) {
        setBusy(false);
        return;
      } else if (imageFile.size > 2 * 1024 * 1024) {
        setBusy(false);
        return;
      }
    }
    if (imageFileEn) {
      const path = await uploadCover(imageFileEn);
      if (path) {
        nextImagePathEn = path;
        setImagePathEn(path);
      } else if (
        imageFileEn.type &&
        !["image/jpeg", "image/png", "image/webp"].includes(imageFileEn.type)
      ) {
        setBusy(false);
        return;
      } else if (imageFileEn.size > 2 * 1024 * 1024) {
        setBusy(false);
        return;
      }
    }

    const usageGuideIdStored = usageGuide.trim() || defaultUsageGuideText("id");
    const usageGuideEnStored =
      usageGuideEn.trim() || defaultUsageGuideText("en");

    // title/body columns are Indonesian primary; never wipe with "" when EN-only —
    // use EN title as NOT NULL stub so cards/metadata stay usable.
    const titleIdStored = okId
      ? draft.title
      : draft.title_en || existing?.title?.trim() || "Untitled";
    const bodyIdStored = okId ? draft.body : "";
    const imageIdStored = okId ? nextImagePath : null;

    const payloadBase = {
      title: titleIdStored,
      description: okId ? draft.description : null,
      mode,
      body: bodyIdStored || (okEn ? "" : draft.body_en || ""),
      category,
      tags: okId ? draft.tags : [],
      video_url: videoUrl.trim() || null,
      image_path: imageIdStored,
      ai_platform: aiPlatform,
      usage_guide: okId ? usageGuideIdStored : null,
      is_public: visibility.is_public,
      public_until: visibility.public_until
        ? visibility.public_until.toISOString()
        : null,
      updated_at: new Date().toISOString(),
    };

    const payloadWithEn = {
      ...payloadBase,
      title: titleIdStored,
      description: okId ? draft.description : null,
      body: bodyIdStored,
      tags: okId ? draft.tags : [],
      image_path: imageIdStored,
      title_en: okEn ? draft.title_en : null,
      description_en: okEn ? draft.description_en : null,
      body_en: okEn ? draft.body_en : null,
      tags_en: okEn ? draft.tags_en : [],
      image_path_en: nextImagePathEn,
      usage_guide: okId ? usageGuideIdStored : null,
      usage_guide_en: okEn ? usageGuideEnStored : null,
    };

    let migrationWarn = false;
    let promptId = existing?.id;
    if (existing) {
      let { error: updateError } = await supabase
        .from("prompts")
        .update(payloadWithEn)
        .eq("id", existing.id)
        .eq("author_id", user.id);
      if (updateError?.message?.includes("title_en")) {
        const retry = await supabase
          .from("prompts")
          .update(payloadBase)
          .eq("id", existing.id)
          .eq("author_id", user.id);
        updateError = retry.error;
        if (!updateError) migrationWarn = true;
      }
      if (updateError) {
        setError(updateError.message);
        setBusy(false);
        return;
      }
      await supabase.from("prompt_fields").delete().eq("prompt_id", existing.id);
    } else {
      let { data, error: insertError } = await supabase
        .from("prompts")
        .insert({ ...payloadWithEn, author_id: user.id })
        .select("id")
        .single();
      if (insertError?.message?.includes("title_en")) {
        const retry = await supabase
          .from("prompts")
          .insert({ ...payloadBase, author_id: user.id })
          .select("id")
          .single();
        data = retry.data;
        insertError = retry.error;
        if (!insertError) migrationWarn = true;
      }
      if (insertError || !data) {
        setError(insertError?.message ?? t("editorCreateFail"));
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
    const warnQs = migrationWarn ? "?notice=i18n_migration" : "";
    if (username && promptId) {
      router.push(
        `${localePath(locale, promptDetailPath(username, promptId))}${warnQs}`,
      );
    } else if (promptId) {
      router.push(`${localePath(locale, `/prompts/${promptId}`)}${warnQs}`);
    }
    router.refresh();
  }

  const isId = contentLang === "id";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-ink">
        {existing ? t("editorEditTitle") : t("editorCreateTitle")}
      </h1>

      <div className="flex gap-1 rounded-full bg-soft p-1 ring-1 ring-secondary/40">
        <button
          type="button"
          onClick={() => setContentLang("id")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            isId ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          {t("contentLangId")}
        </button>
        <button
          type="button"
          onClick={() => setContentLang("en")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            !isId ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          {t("contentLangEn")}
        </button>
      </div>
      <p className="text-xs text-ink-muted">{t("editorLangHint")}</p>

      <label className="block space-y-1">
        <span className="text-sm font-medium">
          {isId ? t("editorTitleId") : t("editorTitleEn")}
        </span>
        <input
          className="field-control w-full rounded-lg px-3 py-2"
          value={isId ? title : titleEn}
          onChange={(e) =>
            isId ? setTitle(e.target.value) : setTitleEn(e.target.value)
          }
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">
          {isId ? t("editorDescId") : t("editorDescEn")}
        </span>
        <textarea
          className="field-control w-full rounded-lg px-3 py-2"
          rows={2}
          value={isId ? description : descriptionEn}
          onChange={(e) =>
            isId
              ? setDescription(e.target.value)
              : setDescriptionEn(e.target.value)
          }
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">{t("editorCategory")}</span>
        <select
          className="field-control w-full rounded-lg px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {categoryLabel(c.slug, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">{t("editorAiPlatform")}</span>
        <select
          className="field-control w-full rounded-lg px-3 py-2"
          value={aiPlatform}
          onChange={(e) => setAiPlatform(parseAiPlatform(e.target.value))}
        >
          {AI_PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {locale === "en" ? p.labelEn : p.labelId}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-muted">{t("editorAiPlatformHint")}</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">
          {isId ? t("editorUsageId") : t("editorUsageEn")}
        </span>
        <textarea
          className="field-control w-full rounded-lg px-3 py-2 text-sm"
          rows={8}
          value={isId ? usageGuide : usageGuideEn}
          onChange={(e) =>
            isId
              ? setUsageGuide(e.target.value)
              : setUsageGuideEn(e.target.value)
          }
          placeholder={defaultUsageGuidePlaceholder(locale)}
        />
        <p className="text-xs text-ink-muted">{t("editorUsageHint")}</p>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${mode === "template" ? "bg-primary-hover text-white" : "border"}`}
          onClick={() => setMode("template")}
        >
          {t("editorModeTemplate")}
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${mode === "static" ? "bg-primary-hover text-white" : "border"}`}
          onClick={() => setMode("static")}
        >
          {t("editorModeStatic")}
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">
          {mode === "template"
            ? isId
              ? t("editorBodyTemplateId")
              : t("editorBodyTemplateEn")
            : isId
              ? t("editorBodyStaticId")
              : t("editorBodyStaticEn")}
        </span>
        <textarea
          className="field-control w-full rounded-lg px-3 py-2 font-mono text-sm"
          rows={8}
          value={isId ? body : bodyEn}
          onChange={(e) =>
            isId ? setBody(e.target.value) : setBodyEn(e.target.value)
          }
          placeholder={
            mode === "template"
              ? t("editorBodyPhTemplate")
              : t("editorBodyPhStatic")
          }
        />
      </label>

      {mode === "template" && (
        <div className="space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{t("editorParams")}</p>
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
              {t("editorAddField")}
            </button>
          </div>
          {fields.map((f, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-lg bg-soft/40 p-3 sm:grid-cols-2"
            >
              <input
                className="field-control rounded px-2 py-1 text-sm"
                value={f.label}
                onChange={(e) => updateField(i, { label: e.target.value })}
                placeholder="Label"
              />
              <select
                className="field-control rounded px-2 py-1 text-sm"
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
                  onChange={(e) =>
                    updateField(i, { required: e.target.checked })
                  }
                />
                {t("editorRequired")}
              </label>
              <p className="text-xs text-ink/60">key: {`{{${f.field_key}}}`}</p>
              {usesOptions(f.field_type) && (
                <input
                  className="field-control rounded px-2 py-1 text-sm sm:col-span-2"
                  placeholder={t("editorOptionsPh")}
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
        <span className="text-sm font-medium">
          {isId ? t("editorTagsId") : t("editorTagsEn")}
        </span>
        <input
          className="field-control w-full rounded-lg px-3 py-2"
          value={isId ? tags : tagsEn}
          onChange={(e) =>
            isId ? setTags(e.target.value) : setTagsEn(e.target.value)
          }
        />
      </label>

      <FileUploadField
        key={contentLang}
        label={isId ? t("editorImageId") : t("editorImageEn")}
        buttonLabel={isId ? t("editorImagePickId") : t("editorImagePickEn")}
        hint={
          isId
            ? imagePath
              ? t("editorImageHintIdHas")
              : t("editorImageHintIdEmpty")
            : imagePathEn
              ? t("editorImageHintEnHas")
              : t("editorImageHintEnEmpty")
        }
        showPreview
        previewUrl={
          isId
            ? imagePath
              ? publicImageUrl(imagePath)
              : null
            : imagePathEn
              ? publicImageUrl(imagePathEn)
              : null
        }
        previewAlt={isId ? t("editorImageId") : t("editorImageEn")}
        fileName={isId ? imageFile?.name : imageFileEn?.name}
        onChange={(file) => {
          if (isId) setImageFile(file);
          else setImageFileEn(file);
        }}
      />

      <label className="block space-y-1">
        <span className="text-sm font-medium">{t("editorVideo")}</span>
        <input
          className="field-control w-full rounded-lg px-3 py-2"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/..."
          title={t("editorVideo")}
        />
      </label>

      <VisibilityControls value={intent} onChange={setIntent} />

      <TermsAcceptance checked={acceptedTerms} onChange={setAcceptedTerms} />

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {!acceptedTerms ? (
        <p className="text-xs text-ink-muted">{t("editorAcceptToSave")}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy || !acceptedTerms}
        title={
          !acceptedTerms
            ? t("editorNeedTerms")
            : busy
              ? t("saving")
              : t("editorSave")
        }
        className="rounded-xl bg-primary-hover px-5 py-3 text-white disabled:opacity-60"
      >
        {busy ? t("saving") : t("editorSave")}
      </button>
    </form>
  );
}
