// Keyboard shortcuts (ARCHITECTURE.md §8, DESIGN.md §7.2, LOGIC.md §9).
import { describe, it, expect } from "vitest";
import { QUESTIONS } from "../src/data/questions.js";
import { commandForKey } from "../src/logic/keys.js";

const byFormat = (f) => QUESTIONS.find((q) => q.format === f);
const choice = byFormat("choice4");
const tf = byFormat("trueFalse");
const ads = byFormat("ads");

describe("commandForKey", () => {
  it("1–4 select display positions, only as many as there are options", () => {
    expect(commandForKey("1", choice)).toEqual({ type: "select", index: 0 });
    expect(commandForKey("4", choice)).toEqual({ type: "select", index: 3 });
    expect(commandForKey("5", choice)).toBeNull();
    expect(commandForKey("3", tf)).toBeNull();
  });

  it("R/F only on Richtig/Falsch, A/B only on the ads question", () => {
    expect(commandForKey("r", tf)).toEqual({ type: "select", index: 0 });
    expect(commandForKey("F", tf)).toEqual({ type: "select", index: 1 });
    expect(commandForKey("a", ads)).toEqual({ type: "select", index: 0 });
    expect(commandForKey("B", ads)).toEqual({ type: "select", index: 1 });
    expect(commandForKey("r", choice)).toBeNull();
    expect(commandForKey("a", choice)).toBeNull();
  });

  it("S, G, D and Backspace, in either case", () => {
    expect(commandForKey("s", choice)).toEqual({ type: "sure" });
    expect(commandForKey("G", choice)).toEqual({ type: "guessed" });
    expect(commandForKey("d", tf)).toEqual({ type: "unknown" });
    expect(commandForKey("Backspace", choice)).toEqual({ type: "back" });
  });

  it("ignores everything else", () => {
    for (const k of ["Enter", " ", "x", "0", "Tab", "ArrowDown"]) expect(commandForKey(k, choice)).toBeNull();
    expect(commandForKey("1", null)).toBeNull();
  });
});
