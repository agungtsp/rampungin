import { describe, expect, it } from "vitest";
import {
  filterByLocale,
  isAvailableInLocale,
  localizePrompt,
} from "@/lib/i18n/prompt";

const sample = {
  title: "Judul ID",
  description: "Deskripsi",
  body: "Isi prompt Indonesia",
  tags: ["a"],
  image_path: "id.jpg",
  title_en: "EN Title",
  description_en: "EN desc",
  body_en: "English body",
  tags_en: ["b"],
  image_path_en: "en.jpg",
};

describe("prompt i18n availability", () => {
  it("requires title+body for Indonesian", () => {
    expect(isAvailableInLocale(sample, "id")).toBe(true);
    expect(
      isAvailableInLocale({ ...sample, body: "" }, "id"),
    ).toBe(false);
    expect(
      isAvailableInLocale({ ...sample, body: undefined }, "id"),
    ).toBe(false);
  });

  it("requires title_en+body_en for English", () => {
    expect(isAvailableInLocale(sample, "en")).toBe(true);
    expect(
      isAvailableInLocale({ ...sample, body_en: null }, "en"),
    ).toBe(false);
  });

  it("keeps list rows when body is present (homepage select shape)", () => {
    const rows = [sample, { ...sample, title: "Lain", body: "Lain body" }];
    expect(filterByLocale(rows, "id")).toHaveLength(2);
    expect(filterByLocale(rows, "en")).toHaveLength(2);
  });

  it("drops ID rows when body missing from payload (regression)", () => {
    const withoutBody = {
      title: sample.title,
      title_en: sample.title_en,
      body_en: sample.body_en,
    };
    expect(filterByLocale([withoutBody], "id")).toHaveLength(0);
    expect(filterByLocale([withoutBody], "en")).toHaveLength(1);
  });

  it("localizes cover per locale without cross-fallback", () => {
    expect(localizePrompt(sample, "id").imagePath).toBe("id.jpg");
    expect(localizePrompt(sample, "en").imagePath).toBe("en.jpg");
  });
});
