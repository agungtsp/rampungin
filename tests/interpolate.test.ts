import { describe, expect, it } from "vitest";
import { interpolateTemplate, missingRequiredFields } from "@/lib/interpolate";

describe("interpolateTemplate", () => {
  it("replaces placeholders", () => {
    expect(
      interpolateTemplate("Halo {{nama}}, fokus {{topik}}", {
        nama: "Agung",
        topik: "AI",
      }),
    ).toBe("Halo Agung, fokus AI");
  });

  it("uses empty string for missing keys", () => {
    expect(interpolateTemplate("X {{a}} Y", {})).toBe("X  Y");
  });

  it("inserts multi-select checkbox values joined by comma", () => {
    expect(
      interpolateTemplate("Gaya: {{gaya}}", { gaya: "Formal, Santai" }),
    ).toBe("Gaya: Formal, Santai");
  });
});

describe("missingRequiredFields", () => {
  it("returns labels of empty required fields", () => {
    expect(
      missingRequiredFields(
        [
          { field_key: "a", label: "Nama", required: true },
          { field_key: "b", label: "Opsional", required: false },
        ],
        { a: "  ", b: "" },
      ),
    ).toEqual(["Nama"]);
  });
});
