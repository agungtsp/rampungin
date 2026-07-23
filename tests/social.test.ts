import { describe, expect, it } from "vitest";
import { filledSocials, normalizeSocialUrl } from "@/lib/social";

describe("normalizeSocialUrl", () => {
  it("returns empty for blank", () => {
    expect(normalizeSocialUrl("  ")).toBe("");
  });

  it("keeps https urls", () => {
    expect(normalizeSocialUrl("https://instagram.com/agung")).toBe(
      "https://instagram.com/agung",
    );
  });

  it("prefixes https when missing", () => {
    expect(normalizeSocialUrl("www.threads.net/@agung")).toBe(
      "https://www.threads.net/@agung",
    );
  });
});

describe("filledSocials", () => {
  it("only returns platforms with values", () => {
    const links = filledSocials({
      threads_url: null,
      instagram_url: "instagram.com/x",
      youtube_url: "",
      linkedin_url: "https://linkedin.com/in/x",
    });
    expect(links.map((l) => l.key)).toEqual(["instagram", "linkedin"]);
    expect(links[0].href).toBe("https://instagram.com/x");
  });
});
