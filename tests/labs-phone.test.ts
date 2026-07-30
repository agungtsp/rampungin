import { describe, expect, it } from "vitest";
import {
  isValidPhone,
  normalizePhone,
  phoneDigitsForWa,
  whatsAppLink,
} from "@/lib/labs-phone";

describe("labs-phone", () => {
  it("normalizes spaces and dashes", () => {
    expect(normalizePhone("+62 812-3456-7890")).toBe("+6281234567890");
    expect(normalizePhone("0812 3456 7890")).toBe("081234567890");
  });

  it("builds wa.me links without plus", () => {
    expect(whatsAppLink("+62 812-3456-7890")).toBe(
      "https://wa.me/6281234567890",
    );
    expect(phoneDigitsForWa("+6281234567890")).toBe("6281234567890");
  });

  it("validates length", () => {
    expect(isValidPhone("+6281234567890")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
  });
});
