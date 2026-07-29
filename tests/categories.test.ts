import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  categoryIconName,
  categoryLabel,
  isValidCategory,
} from "@/lib/categories";

describe("categories", () => {
  it("has 10 unique category slugs", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(slugs.length).toBe(10);
    expect(new Set(slugs).size).toBe(10);
  });

  it("validates known and unknown slugs", () => {
    expect(isValidCategory("marketing")).toBe(true);
    expect(isValidCategory("bogus")).toBe(false);
    expect(isValidCategory(null)).toBe(false);
  });

  it("returns label for slug, falling back to Lainnya / Other", () => {
    expect(categoryLabel("coding")).toBe("Coding & Dev");
    expect(categoryLabel("bogus")).toBe("Lainnya");
    expect(categoryLabel(null)).toBe("Lainnya");
    expect(categoryLabel("menulis", "en")).toBe("Writing");
    expect(categoryLabel("bogus", "en")).toBe("Other");
  });

  it("exposes a stable icon key for every category and fallbacks", () => {
    const allowed = new Set([
      "megaphone",
      "code",
      "pencil-simple",
      "palette",
      "chart-line-up",
      "graduation-cap",
      "lightning",
      "chart-bar",
      "film-strip",
      "puzzle-piece",
    ]);
    for (const c of CATEGORIES) {
      expect(allowed.has(c.icon)).toBe(true);
      expect(categoryIconName(c.slug)).toBe(c.icon);
    }
    expect(categoryIconName(null)).toBe("puzzle-piece");
    expect(categoryIconName("bogus")).toBe("puzzle-piece");
    expect(categoryIconName("")).toBe("squares-four");
    expect(categoryIconName("all")).toBe("squares-four");
  });
});
