import { describe, expect, it } from "vitest";
import { trendingScore } from "@/lib/trending";

describe("trendingScore", () => {
  it("weights likes double and includes generates", () => {
    expect(trendingScore(3, 4)).toBe(10);
    expect(trendingScore(3, 4, 2)).toBe(12);
  });
});
