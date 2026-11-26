import { describe, expect, test } from "vitest";
import {
  calculateProgressWidth,
  getCurrentStep,
  getStatusMessage,
  getStepState,
} from "./bill-progress";

describe("getStatusMessage", () => {
  test("preparing の場合は '提出前' を返す", () => {
    expect(getStatusMessage("preparing", null)).toBe("提出前");
  });

  test("preparing の場合は statusNote があっても '提出前' を返す", () => {
    expect(getStatusMessage("preparing", "審議中メモ")).toBe("提出前");
  });

  test("preparing 以外で statusNote がある場合はそれを返す", () => {
    expect(getStatusMessage("introduced", "委員会で審議中")).toBe(
      "委員会で審議中"
    );
  });

  test("preparing 以外で statusNote が null の場合は空文字を返す", () => {
    expect(getStatusMessage("enacted", null)).toBe("");
  });

  test("preparing 以外で statusNote が undefined の場合は空文字を返す", () => {
    expect(getStatusMessage("rejected", undefined)).toBe("");
  });

  test("reported は statusNote（報告（議決対象外））をそのまま返す", () => {
    expect(getStatusMessage("reported", "報告（議決対象外）")).toBe(
      "報告（議決対象外）"
    );
  });
});

describe("getStepState", () => {
  test("isPreparing が true の場合は常に inactive", () => {
    expect(getStepState(1, 0, true)).toBe("inactive");
    expect(getStepState(2, 2, true)).toBe("inactive");
    expect(getStepState(3, 3, true)).toBe("inactive");
  });

  test("stepNumber が currentStep 以下の場合は active", () => {
    expect(getStepState(1, 2, false)).toBe("active");
    expect(getStepState(2, 2, false)).toBe("active");
    expect(getStepState(1, 3, false)).toBe("active");
  });

  test("stepNumber が currentStep より大きい場合は inactive", () => {
    expect(getStepState(3, 2, false)).toBe("inactive");
    expect(getStepState(2, 1, false)).toBe("inactive");
  });
});

describe("calculateProgressWidth", () => {
  test("ステップ0は0%", () => {
    expect(calculateProgressWidth(0)).toBe(0);
  });

  test("ステップ1は約16.7%", () => {
    expect(calculateProgressWidth(1)).toBeCloseTo(100 / 6);
  });

  test("ステップ2は50%", () => {
    expect(calculateProgressWidth(2)).toBe(50);
  });

  test("ステップ3は100%", () => {
    expect(calculateProgressWidth(3)).toBe(100);
  });

  test("範囲外のステップは0%", () => {
    expect(calculateProgressWidth(4)).toBe(0);
    expect(calculateProgressWidth(-1)).toBe(0);
  });
});

describe("getCurrentStep", () => {
  test("preparing は 0", () => {
    expect(getCurrentStep("preparing")).toBe(0);
  });

  test("introduced は 1（提出）", () => {
    expect(getCurrentStep("introduced")).toBe(1);
  });

  test("in_originating_house は 2（審議）", () => {
    expect(getCurrentStep("in_originating_house")).toBe(2);
  });

  test("in_receiving_house も 2（審議。一院制では区別しない）", () => {
    expect(getCurrentStep("in_receiving_house")).toBe(2);
  });

  test("enacted は 3（議決）", () => {
    expect(getCurrentStep("enacted")).toBe(3);
  });

  test("rejected は 3（議決）", () => {
    expect(getCurrentStep("rejected")).toBe(3);
  });

  test("reported は 1（単独ステップ表示のための提出済み相当）", () => {
    expect(getCurrentStep("reported")).toBe(1);
  });
});
