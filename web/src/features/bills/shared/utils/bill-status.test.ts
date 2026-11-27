import { describe, expect, it } from "vitest";
import { getCardStatusLabel, getStatusVariant } from "./bill-status";

describe("getCardStatusLabel", () => {
  it.each([
    ["introduced", "市議会審議中"],
    ["in_originating_house", "市議会審議中"],
    ["in_receiving_house", "市議会審議中"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getCardStatusLabel(status)).toBe(expected);
  });

  it("enacted → 議案成立", () => {
    expect(getCardStatusLabel("enacted")).toBe("議案成立");
  });

  it("rejected → 否決", () => {
    expect(getCardStatusLabel("rejected")).toBe("否決");
  });

  it("reported → 報告", () => {
    expect(getCardStatusLabel("reported")).toBe("報告");
  });

  it("withdrawn → 撤回承認", () => {
    expect(getCardStatusLabel("withdrawn")).toBe("撤回承認");
  });

  it("preparing → 議案提出前", () => {
    expect(getCardStatusLabel("preparing")).toBe("議案提出前");
  });
});

describe("getStatusVariant", () => {
  it.each([
    ["introduced", "light"],
    ["in_originating_house", "light"],
    ["in_receiving_house", "light"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getStatusVariant(status)).toBe(expected);
  });

  it("enacted → default", () => {
    expect(getStatusVariant("enacted")).toBe("default");
  });

  it("rejected → dark", () => {
    expect(getStatusVariant("rejected")).toBe("dark");
  });

  it("reported → muted", () => {
    expect(getStatusVariant("reported")).toBe("muted");
  });

  it("withdrawn → muted", () => {
    expect(getStatusVariant("withdrawn")).toBe("muted");
  });

  it("preparing → muted", () => {
    expect(getStatusVariant("preparing")).toBe("muted");
  });
});
