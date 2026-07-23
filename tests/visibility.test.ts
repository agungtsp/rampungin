import { describe, expect, it } from "vitest";
import {
  applyVisibilityIntent,
  computePublicUntil,
  isEffectivelyPublic,
} from "@/lib/visibility";

describe("isEffectivelyPublic", () => {
  const now = new Date("2026-07-22T12:00:00Z");

  it("is true when public and no expiry", () => {
    expect(isEffectivelyPublic(true, null, now)).toBe(true);
  });

  it("is false when private", () => {
    expect(isEffectivelyPublic(false, null, now)).toBe(false);
  });

  it("is true when public and until is in the future", () => {
    expect(isEffectivelyPublic(true, "2026-07-22T13:00:00Z", now)).toBe(true);
  });

  it("is false when public but until is past", () => {
    expect(isEffectivelyPublic(true, "2026-07-22T11:00:00Z", now)).toBe(false);
  });
});

describe("applyVisibilityIntent", () => {
  const now = new Date("2026-07-22T12:00:00Z");

  it("sets private and clears until", () => {
    expect(applyVisibilityIntent({ kind: "private" }, now)).toEqual({
      is_public: false,
      public_until: null,
    });
  });

  it("sets public unlimited", () => {
    expect(applyVisibilityIntent({ kind: "public" }, now)).toEqual({
      is_public: true,
      public_until: null,
    });
  });

  it("sets timed public", () => {
    const r = applyVisibilityIntent({ kind: "timed", hours: 24 }, now);
    expect(r.is_public).toBe(true);
    expect(r.public_until?.toISOString()).toBe("2026-07-23T12:00:00.000Z");
  });
});

describe("computePublicUntil", () => {
  it("rejects non-positive hours", () => {
    expect(() => computePublicUntil(0)).toThrow();
    expect(() => computePublicUntil(-1)).toThrow();
  });
});
