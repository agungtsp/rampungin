import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
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
});
