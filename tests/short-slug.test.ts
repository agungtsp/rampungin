import { describe, expect, it } from "vitest";
import {
  generateShortSlug,
  isValidShortSlug,
  normalizeShortSlug,
  shortLinkPath,
} from "@/lib/short-slug";

describe("short-slug", () => {
  it("normalizes and validates custom slugs", () => {
    expect(normalizeShortSlug(" My Prompt! ")).toBe("my-prompt");
    expect(isValidShortSlug("my-prompt")).toBe(true);
    expect(isValidShortSlug("ab")).toBe(false);
    expect(isValidShortSlug("-bad")).toBe(false);
  });

  it("generates valid random slugs", () => {
    const slug = generateShortSlug();
    expect(slug).toHaveLength(8);
    expect(isValidShortSlug(slug)).toBe(true);
  });

  it("builds /p path", () => {
    expect(shortLinkPath("demo")).toBe("/p/demo");
  });
});
