import type { AiPlatform } from "@/lib/ai-platform";
import { parseAiPlatform } from "@/lib/ai-platform";

/** Build ChatGPT / AI Studio URLs that prefill the prompt via query param. */
export function chatgptPromptUrl(text: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(text)}`;
}

/** Google AI Studio — supports `prompt=` prefill on new chat. */
export function geminiPromptUrl(text: string): string {
  return `https://aistudio.google.com/prompts/new_chat?prompt=${encodeURIComponent(text)}`;
}

/**
 * Open target AI apps in new tabs with the generated prompt.
 * Call synchronously inside a user click handler to avoid popup blockers.
 */
export function openAiShortcuts(
  text: string,
  platform: AiPlatform | string | null | undefined = "all",
): void {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") return;

  const p = parseAiPlatform(platform);
  const openChatgpt = p === "all" || p === "chatgpt";
  const openGemini = p === "all" || p === "gemini";

  if (openChatgpt) {
    window.open(chatgptPromptUrl(trimmed), "_blank", "noopener,noreferrer");
  }
  if (openGemini) {
    window.open(geminiPromptUrl(trimmed), "_blank", "noopener,noreferrer");
  }
}
