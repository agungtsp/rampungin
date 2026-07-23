import { describe, expect, it } from "vitest";
import {
  expandSmartSearch,
  rankPromptsByIntent,
  scorePromptAgainstIntent,
  tokenizeIntent,
} from "@/lib/smart-search";
import { parsePageSize, totalPages } from "@/lib/pagination";

describe("tokenizeIntent", () => {
  it("drops stopwords and keeps meaningful tokens", () => {
    expect(tokenizeIntent("saya mau buat landing page untuk SaaS")).toEqual(
      expect.arrayContaining(["landing", "page", "saas"]),
    );
  });
});

describe("expandSmartSearch", () => {
  it("maps marketing intent to category", () => {
    const r = expandSmartSearch(
      "butuh copywriting landing page conversion funnel",
    );
    expect(r.preferredCategories).toContain("marketing");
  });
});

describe("score + rank", () => {
  const prompts = [
    {
      id: "1",
      title: "Funnel Copywriter Landing Page",
      description: "Conversion system",
      category: "marketing",
      tags: ["landing-page"],
      body: "landing page copy",
    },
    {
      id: "2",
      title: "SQL Performance Coach",
      description: "Query tuning",
      category: "coding",
      tags: ["sql"],
      body: "explain analyze",
    },
  ];

  it("scores marketing prompt higher for landing intent", () => {
    const intent = "buat landing page marketing conversion";
    expect(scorePromptAgainstIntent(prompts[0], intent)).toBeGreaterThan(
      scorePromptAgainstIntent(prompts[1], intent),
    );
    expect(rankPromptsByIntent(prompts, intent)[0].id).toBe("1");
  });
});

describe("pagination", () => {
  it("parses page size whitelist", () => {
    expect(parsePageSize("50")).toBe(50);
    expect(parsePageSize("7")).toBe(10);
  });
  it("computes total pages", () => {
    expect(totalPages(95, 20)).toBe(5);
  });
});
