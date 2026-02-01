import { describe, expect, it } from "vitest";
import { companySlug } from "./slugs";

describe("companySlug", () => {
  it("lowercases and hyphenates a simple name", () => {
    expect(companySlug("Trade Me")).toBe("trade-me");
  });

  it("handles already-lowercase names", () => {
    expect(companySlug("datacom")).toBe("datacom");
  });

  it("replaces multiple special characters with a single hyphen", () => {
    expect(companySlug("Fisher & Paykel Healthcare")).toBe(
      "fisher-paykel-healthcare",
    );
  });

  it("strips leading and trailing hyphens", () => {
    expect(companySlug("--Leading Trailing--")).toBe("leading-trailing");
  });

  it("handles parentheses and punctuation", () => {
    expect(companySlug("Air New Zealand (ANZ)")).toBe("air-new-zealand-anz");
  });

  it("collapses consecutive non-alphanumeric characters", () => {
    expect(companySlug("Spark --- NZ")).toBe("spark-nz");
  });

  it("handles single-word names", () => {
    expect(companySlug("Halter")).toBe("halter");
  });

  it("handles names with numbers", () => {
    expect(companySlug("9Spokes")).toBe("9spokes");
  });

  it("handles names with apostrophes", () => {
    expect(companySlug("Talley's")).toBe("talley-s");
  });
});
