// Credits written as text (logic/points.js).
import { describe, it, expect } from "vitest";
import { formatPoints } from "../src/logic/points.js";

describe("formatPoints", () => {
  it("writes halves, signs and whole numbers", () => {
    expect(formatPoints(1)).toBe("1");
    expect(formatPoints(1, { sign: true })).toBe("+1");
    expect(formatPoints(0.5)).toBe("½");
    expect(formatPoints(-0.5)).toBe("−½");
    expect(formatPoints(1.5)).toBe("1½");
    expect(formatPoints(0, { sign: true })).toBe("0");
  });
});
