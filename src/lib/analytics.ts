type GtagEventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getGaMeasurementId(): string {
  return (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
}

export function isGaEnabled(): boolean {
  return Boolean(getGaMeasurementId());
}

/** Fire a GA4 event (no-op when GA is not configured). */
export function trackEvent(
  eventName: string,
  params: GtagEventParams = {},
): void {
  if (typeof window === "undefined" || !window.gtag || !isGaEnabled()) return;
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    cleaned[k] = v;
  }
  window.gtag("event", eventName, cleaned);
}

/** SPA / soft-nav page view for App Router. */
export function trackPageView(url: string, title?: string): void {
  const id = getGaMeasurementId();
  if (typeof window === "undefined" || !window.gtag || !id) return;
  window.gtag("event", "page_view", {
    page_path: url,
    page_location: window.location.origin + url,
    page_title: title || document.title,
    send_to: id,
  });
  // Keep Engagement reports aligned with path changes
  window.gtag("config", id, {
    page_path: url,
    page_title: title || document.title,
  });
}

export function trackGeneratePrompt(promptId: string, mode: string): void {
  trackEvent("generate_prompt", {
    prompt_id: promptId,
    prompt_mode: mode,
  });
}

export function trackCopyPrompt(promptId: string, mode: string): void {
  trackEvent("copy_prompt", {
    prompt_id: promptId,
    prompt_mode: mode,
  });
}

export function trackSavePrompt(promptId: string, action: "save" | "unsave"): void {
  trackEvent("save_prompt", {
    prompt_id: promptId,
    save_action: action,
  });
}

export function trackSearch(query: string, tag?: string): void {
  trackEvent("search", {
    search_term: query.slice(0, 100),
    search_tag: tag?.slice(0, 40),
  });
}

export function trackLogin(method: string = "google"): void {
  trackEvent("login", { method });
}

export function trackShare(method: string, promptId?: string): void {
  trackEvent("share", {
    method,
    content_type: "prompt",
    item_id: promptId,
  });
}

export function trackOpenAiShortcut(
  platform: "chatgpt" | "gemini",
  promptId: string,
): void {
  trackEvent("open_ai_shortcut", {
    ai_platform: platform,
    prompt_id: promptId,
  });
}
