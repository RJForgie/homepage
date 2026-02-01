import { describe, expect, it } from "vitest";
import { formatCount, formatLevel } from "./formatters";

describe("formatCount", () => {
  it("returns the number as-is below 1000", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1)).toBe("1");
    expect(formatCount(999)).toBe("999");
  });

  it("formats 1000 as 1.0k", () => {
    expect(formatCount(1000)).toBe("1.0k");
  });

  it("formats thousands with one decimal place", () => {
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(2300)).toBe("2.3k");
    expect(formatCount(10000)).toBe("10.0k");
  });

  it("rounds to one decimal place", () => {
    expect(formatCount(1550)).toBe("1.6k");
    expect(formatCount(1549)).toBe("1.5k");
  });
});

describe("formatLevel", () => {
  it("replaces underscores with spaces and title-cases", () => {
    expect(formatLevel("senior_engineer")).toBe("Senior Engineer");
  });

  it("handles single words", () => {
    expect(formatLevel("junior")).toBe("Junior");
  });

  it("handles multiple underscores", () => {
    expect(formatLevel("mid_level_developer")).toBe("Mid Level Developer");
  });

  it("handles already-capitalized input", () => {
    expect(formatLevel("Senior")).toBe("Senior");
  });

  it("title-cases words with no underscores", () => {
    expect(formatLevel("remote")).toBe("Remote");
  });
});
