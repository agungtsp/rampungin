import type { Locale } from "@/lib/i18n/locale";
import {
  aiPlatformLabel,
  parseAiPlatform,
  type AiPlatform,
} from "@/lib/ai-platform";

const DEFAULT_ID = `Cara memakai prompt ini

1. Isi form parameter di halaman ini (jika ada), lalu klik Hasilkan prompt / Salin.
2. Buka ChatGPT (chatgpt.com) atau Google AI Studio (aistudio.google.com) di tab baru — atau pakai tombol shortcut setelah Hasilkan.
3. Buat chat baru (jika belum via shortcut), lalu tempel (paste) seluruh teks hasil prompt ke kolom chat.
4. Tekan Enter / Kirim. Sesuaikan jawaban AI jika perlu (misalnya minta versi lebih singkat atau lebih formal).

Tips
• Pastikan tidak ada placeholder {{...}} yang belum terisi sebelum menempel.
• Untuk hasil terbaik, tempel prompt sebagai pesan pertama di percakapan baru.
• Prompt berlabel ChatGPT atau Gemini dioptimalkan untuk platform tersebut; label All cocok untuk keduanya.
• Shortcut AI Studio memakai parameter URL prompt= agar teks terisi otomatis.`;

const DEFAULT_EN = `How to use this prompt

1. Fill in the parameter form on this page (if any), then click Generate prompt / Copy.
2. Open ChatGPT (chatgpt.com) or Google AI Studio (aistudio.google.com) in a new tab — or use the shortcut buttons after Generate.
3. Start a new chat (if not opened via shortcut), then paste the full generated prompt text into the message box.
4. Press Enter / Send. Refine the AI reply if needed (e.g. ask for a shorter or more formal version).

Tips
• Make sure no {{...}} placeholders remain before you paste.
• For best results, paste the prompt as the first message in a new conversation.
• Prompts labeled ChatGPT or Gemini are tuned for that product; All works with both.
• The AI Studio shortcut uses the prompt= URL parameter so text is prefilled automatically.`;

function platformHint(platform: AiPlatform, locale: Locale): string {
  if (locale === "en") {
    if (platform === "chatgpt") {
      return "This prompt is optimized for ChatGPT. You can still try it in other assistants, but results may vary.";
    }
    if (platform === "gemini") {
      return "This prompt is optimized for Google Gemini. You can still try it in other assistants, but results may vary.";
    }
    return "This prompt is written to work well in both ChatGPT and Gemini.";
  }
  if (platform === "chatgpt") {
    return "Prompt ini dioptimalkan untuk ChatGPT. Boleh dicoba di asisten lain, tetapi hasilnya bisa berbeda.";
  }
  if (platform === "gemini") {
    return "Prompt ini dioptimalkan untuk Google Gemini. Boleh dicoba di asisten lain, tetapi hasilnya bisa berbeda.";
  }
  return "Prompt ini ditulis agar cocok dipakai di ChatGPT maupun Gemini.";
}

/** Resolve usage guide for display; falls back to informative default. */
export function resolveUsageGuide(
  locale: Locale,
  platform: AiPlatform | string | null | undefined,
  usageGuide?: string | null,
  usageGuideEn?: string | null,
): { title: string; body: string; platformNote: string } {
  const p = parseAiPlatform(platform);
  const body =
    locale === "en"
      ? usageGuideEn?.trim() || DEFAULT_EN
      : usageGuide?.trim() || DEFAULT_ID;

  return {
    title: locale === "en" ? "How to use" : "Cara menggunakan",
    body,
    platformNote: `${aiPlatformLabel(p, locale)}. ${platformHint(p, locale)}`,
  };
}

export function defaultUsageGuideText(locale: Locale): string {
  return locale === "en" ? DEFAULT_EN : DEFAULT_ID;
}

export function defaultUsageGuidePlaceholder(locale: Locale): string {
  return defaultUsageGuideText(locale);
}
