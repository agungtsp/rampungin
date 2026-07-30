import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots.txt configuration", () => {
  it("generates correct robots rules and sitemap reference", () => {
    const config = robots();
    expect(config.rules).toBeDefined();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toContain("/api/");
    expect(rules.disallow).toContain("/me");
    expect(rules.disallow).toContain("/my-prompts");
    expect(rules.disallow).toContain("/saved");
    expect(rules.disallow).toContain("/admin/");
    expect(rules.disallow).toContain("/*/edit");
    expect(config.sitemap).toMatch(/sitemap\.xml$/);
  });
});
