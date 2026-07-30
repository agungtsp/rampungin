import { describe, expect, it } from "vitest";
import { stripExampleResultSections } from "@/lib/usage-guide";

describe("stripExampleResultSections", () => {
  it("removes English Example result section", () => {
    const input = `## How to use
1. Fill fields

## Example result
Some sample output here

## Tips
Keep going`;
    expect(stripExampleResultSections(input)).toBe(
      `## How to use
1. Fill fields

## Tips
Keep going`,
    );
  });

  it("removes Indonesian Contoh hasil section", () => {
    const input = `## Cara pakai
1. Isi

## Contoh hasil
Hasil contoh

## Tips
Tips tetap`;
    const out = stripExampleResultSections(input);
    expect(out).toContain("## Cara pakai");
    expect(out).toContain("## Tips");
    expect(out).toContain("Tips tetap");
    expect(out).not.toContain("Contoh hasil");
    expect(out).not.toContain("Hasil contoh");
  });
});
