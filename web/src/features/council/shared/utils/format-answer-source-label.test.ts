import { describe, expect, it } from "vitest";
import {
  formatAnswerDetailLabel,
  formatAnswerSourceLabel,
} from "./format-answer-source-label";

describe("formatAnswerSourceLabel", () => {
  it("出典がある場合は出典名つきのラベルにする", () => {
    expect(formatAnswerSourceLabel("議会だよりvol.213")).toBe(
      "答弁要旨（議会だよりvol.213）"
    );
  });

  it("別の会期の出典もそのまま表示する", () => {
    expect(formatAnswerSourceLabel("議会だよりvol.212")).toBe(
      "答弁要旨（議会だよりvol.212）"
    );
  });

  it("出典が無い場合は出典名を補わず、ラベルだけにする", () => {
    expect(formatAnswerSourceLabel(null)).toBe("答弁要旨");
  });
});

describe("formatAnswerDetailLabel", () => {
  it("出典がある場合は出典名つきのラベルにする", () => {
    expect(formatAnswerDetailLabel("会議録")).toBe(
      "答弁の詳しい記録（会議録）"
    );
  });

  it("出典が無い場合は出典名を補わず、ラベルだけにする", () => {
    expect(formatAnswerDetailLabel(null)).toBe("答弁の詳しい記録");
  });
});
