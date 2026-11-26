import { describe, expect, it } from "vitest";
import type { BillStatusEnum } from "../types";
import {
  compareBillListOrder,
  extractBillNumber,
  sortByBillListOrder,
} from "./bill-list-order";

function bill(
  id: string,
  name: string,
  overrides: {
    status?: BillStatusEnum;
    submitted_date?: string | null;
  } = {}
) {
  return {
    id,
    name,
    status: "enacted" as BillStatusEnum,
    submitted_date: null as string | null,
    ...overrides,
  };
}

const ids = (bills: { id: string }[]) => bills.map((b) => b.id);

describe("extractBillNumber", () => {
  it("議案番号を取り出す", () => {
    expect(
      extractBillNumber(
        "議案第139号 第3次東広島市都市計画マスタープランの改定について"
      )
    ).toBe(139);
    expect(extractBillNumber("報告第14号 専決処分の報告について")).toBe(14);
    expect(extractBillNumber("委員会提出議案第6号 決議について")).toBe(6);
    expect(extractBillNumber("承認案第133号 専決処分の承認について")).toBe(133);
  });

  it("件名側の「（第3号）」ではなく先頭の議案番号を取る", () => {
    expect(
      extractBillNumber(
        "議案第150号 令和8年度東広島市一般会計補正予算（第3号）"
      )
    ).toBe(150);
  });

  it("全角数字を半角として読む", () => {
    expect(extractBillNumber("議案第１４７号 条例の制定について")).toBe(147);
  });

  it("番号がない名前は null", () => {
    expect(extractBillNumber("議員派遣について")).toBeNull();
    expect(extractBillNumber("第3次東広島市都市計画マスタープラン")).toBeNull();
    expect(extractBillNumber("")).toBeNull();
  });
});

describe("sortByBillListOrder", () => {
  it("提出日が全件 null なら議案番号の昇順になる", () => {
    const result = sortByBillListOrder([
      bill("b150", "議案第150号 補正予算"),
      bill("b139", "議案第139号 計画の改定"),
      bill("b147", "議案第147号 条例の制定"),
    ]);
    expect(ids(result)).toEqual(["b139", "b147", "b150"]);
  });

  it("ステータスのグループ分けは変えない（成立が報告より前）", () => {
    const result = sortByBillListOrder([
      bill("r14", "報告第14号 専決処分の報告について", { status: "reported" }),
      bill("b156", "議案第156号 決算の認定について"),
      bill("r20", "報告第20号 健全化判断比率について", { status: "reported" }),
      bill("b139", "議案第139号 計画の改定について"),
    ]);
    expect(ids(result)).toEqual(["b139", "b156", "r14", "r20"]);
  });

  it("提出日がある場合は同じステータス内で提出日が新しい順を優先する", () => {
    const result = sortByBillListOrder([
      bill("old", "議案第100号 古い議案", { submitted_date: "2026-03-01" }),
      bill("new", "議案第200号 新しい議案", { submitted_date: "2026-06-01" }),
    ]);
    expect(ids(result)).toEqual(["new", "old"]);
  });

  it("提出日が同点なら議案番号の昇順で決める", () => {
    const result = sortByBillListOrder([
      bill("b200", "議案第200号", { submitted_date: "2026-06-01" }),
      bill("b100", "議案第100号", { submitted_date: "2026-06-01" }),
    ]);
    expect(ids(result)).toEqual(["b100", "b200"]);
  });

  it("提出日なしは提出日ありより後ろ、番号なしは番号ありより後ろ", () => {
    const result = sortByBillListOrder([
      bill("nonum", "議員派遣について"),
      bill("nodate", "議案第140号 財産の取得について"),
      bill("dated", "議案第139号 計画の改定について", {
        submitted_date: "2026-08-31",
      }),
    ]);
    expect(ids(result)).toEqual(["dated", "nodate", "nonum"]);
  });

  it("入力の並びに依存せず決定的（同条件は id で固定）", () => {
    const a = bill("aaa", "議案第140号 財産の取得について");
    const b = bill("bbb", "議案第140号 財産の取得について");
    expect(ids(sortByBillListOrder([b, a]))).toEqual(["aaa", "bbb"]);
    expect(compareBillListOrder(a, b)).toBeLessThan(0);
    expect(compareBillListOrder(a, a)).toBe(0);
  });

  it("元の配列を変更しない", () => {
    const input = [
      bill("b150", "議案第150号 補正予算"),
      bill("b139", "議案第139号 計画の改定"),
    ];
    sortByBillListOrder(input);
    expect(ids(input)).toEqual(["b150", "b139"]);
  });
});
