import type { VisibilityIntent } from "./types";

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  return value instanceof Date ? value : new Date(value);
}

export function isEffectivelyPublic(
  isPublic: boolean,
  publicUntil: Date | string | null,
  now: Date = new Date(),
): boolean {
  if (!isPublic) return false;
  const until = toDate(publicUntil);
  if (!until) return true;
  return until.getTime() > now.getTime();
}

export function computePublicUntil(
  hours: number | null,
  now: Date = new Date(),
): Date | null {
  if (hours == null) return null;
  if (hours <= 0) throw new Error("Durasi harus lebih dari 0 jam");
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function applyVisibilityIntent(
  intent: VisibilityIntent,
  now: Date = new Date(),
): { is_public: boolean; public_until: Date | null } {
  if (intent.kind === "private") {
    return { is_public: false, public_until: null };
  }
  if (intent.kind === "public") {
    return { is_public: true, public_until: null };
  }
  return {
    is_public: true,
    public_until: computePublicUntil(intent.hours, now),
  };
}
