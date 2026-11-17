// Safety-briefing flow (LOGIC.md §10.1): Start → briefing → (fasten) → TAKE OFF
// → Vocabulary section break. Retake skips the briefing.
import { describe, it, expect } from "vitest";
import * as S from "../src/state.js";

describe("safety briefing flow", () => {
  it("Start goes to the briefing, with the seatbelt unfastened", () => {
    S.start();
    expect(S.state.screen).toBe("briefing");
    expect(S.state.accepted).toBe(false);
    expect(S.state.order).toHaveLength(15);
  });

  it("TAKE OFF does nothing until the seatbelt is fastened", () => {
    S.start();
    S.takeOff();
    expect(S.state.screen).toBe("briefing");
    S.setAccepted(true);
    expect(S.state.accepted).toBe(true);
    S.setAccepted(false); // unfastening works too
    S.takeOff();
    expect(S.state.screen).toBe("briefing");
    S.setAccepted(true);
    S.takeOff();
    expect(S.state.screen).toBe("sectionBreak");
    expect(S.state.index).toBe(0);
  });

  it("the seatbelt can only be changed on the briefing", () => {
    S.start();
    S.setAccepted(true);
    S.takeOff();
    S.setAccepted(false);
    expect(S.state.accepted).toBe(true);
  });

  it("Retake skips the briefing: a fresh attempt at the section break", () => {
    S.start();
    S.setAccepted(true);
    S.takeOff();
    const attempt = S.state.attempt;
    S.retake();
    expect(S.state.screen).toBe("sectionBreak");
    expect(S.state.attempt).toBe(attempt + 1);
    expect(S.state.accepted).toBe(true);
    expect(S.state.answers).toEqual({});
  });
});
