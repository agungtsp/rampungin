import { describe, expect, it } from "vitest";
import { defaultCoverUrl, promptCoverUrl } from "@/lib/cover";

describe("cover", () => {
  it("returns category default cover path", () => {
    expect(defaultCoverUrl("coding")).toBe("/covers/coding.svg");
    expect(defaultCoverUrl(null)).toBe("/covers/lainnya.svg");
    expect(defaultCoverUrl("unknown")).toBe("/covers/lainnya.svg");
  });

  it("prefers real image url when present", () => {
    expect(promptCoverUrl("https://cdn.example/a.png", "coding")).toBe(
      "https://cdn.example/a.png",
    );
    expect(promptCoverUrl(null, "desain")).toBe("/covers/desain.svg");
    expect(promptCoverUrl("  ", "desain")).toBe("/covers/desain.svg");
  });
});
