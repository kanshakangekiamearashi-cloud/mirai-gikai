import { describe, expect, it } from "vitest";
import { pickHomeSections } from "./pick-home-sections";

const bill = (id: string) => ({ id });
const group = (label: string, ...billIds: string[]) => ({
  tag: { id: label, label },
  bills: billIds.map(bill),
});

const shape = (groups: { tag: { id: string }; bills: { id: string }[] }[]) =>
  groups.map((g) => [g.tag.id, g.bills.map((b) => b.id)]);
const ids = (bills: { id: string }[]) => bills.map((b) => b.id);

const base = {
  billsByTag: [] as ReturnType<typeof group>[],
  featuredBills: [] as { id: string }[],
  interviewOpenBills: [] as { id: string }[],
};

describe("pickHomeSections", () => {
  describe("tagGroups", () => {
    it("タグの議案をそのまま残す", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "a"), group("税金", "b")],
      });

      expect(shape(result.tagGroups)).toEqual([
        ["暮らし", ["a"]],
        ["税金", ["b"]],
      ]);
    });

    it("受付中に出した議案もタグ別に残す", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "a", "b")],
        interviewOpenBills: [bill("b")],
      });

      expect(shape(result.tagGroups)).toEqual([["暮らし", ["a", "b"]]]);
    });

    it("注目に出した議案もタグ別に残す", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "a", "b")],
        featuredBills: [bill("a")],
      });

      expect(shape(result.tagGroups)).toEqual([["暮らし", ["a", "b"]]]);
    });

    // 計画タグの唯一の議案が注目に出ても、計画のセクションが消えないこと。
    it("タグの議案が全て注目と重なってもグループを落とさない", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("計画", "139"), group("暮らし", "a")],
        featuredBills: [bill("139")],
      });

      expect(shape(result.tagGroups)).toEqual([
        ["計画", ["139"]],
        ["暮らし", ["a"]],
      ]);
    });

    it("受付中に出した議案も、付いている全てのタグに残す", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "a", "x"), group("税金", "x", "b")],
        interviewOpenBills: [bill("x")],
      });

      expect(shape(result.tagGroups)).toEqual([
        ["暮らし", ["a", "x"]],
        ["税金", ["x", "b"]],
      ]);
    });

    // カテゴリ別セクションはカテゴリごとの一覧なので、重なりはそのまま出す。
    it("複数のタグに付いた議案は全てのタグに出す", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("司法", "x", "a"), group("組織", "x", "b", "a")],
      });

      expect(shape(result.tagGroups)).toEqual([
        ["司法", ["x", "a"]],
        ["組織", ["x", "b", "a"]],
      ]);
    });

    // 見出しだけが残ると、中身が無いカテゴリが並んでしまう。
    it("議案が1件も無いタグはグループごと落とす", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "a"), group("税金")],
      });

      expect(shape(result.tagGroups)).toEqual([["暮らし", ["a"]]]);
    });

    it("渡した配列を書き換えない", () => {
      const billsByTag = [group("暮らし", "a", "b")];

      pickHomeSections({
        ...base,
        billsByTag,
        interviewOpenBills: [bill("a")],
      });

      expect(shape(billsByTag)).toEqual([["暮らし", ["a", "b"]]]);
    });
  });

  describe("shownBills", () => {
    it("受付中・注目・タグ別に出た議案を並べる", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "tag1"), group("税金", "tag2")],
        featuredBills: [bill("feat")],
        interviewOpenBills: [bill("intv")],
      });

      expect(ids(result.shownBills)).toEqual(["intv", "feat", "tag1", "tag2"]);
    });

    // 受付中と注目は意図的に重複させているので、片方に寄せないと2回渡ってしまう。
    it("受付中と注目に重複して出る議案は1件にまとめる", () => {
      const result = pickHomeSections({
        ...base,
        featuredBills: [bill("both")],
        interviewOpenBills: [bill("both")],
      });

      expect(ids(result.shownBills)).toEqual(["both"]);
    });

    it("featuredBills が空なら注目だけの議案を含めない", () => {
      const result = pickHomeSections({
        ...base,
        featuredBills: [],
      });

      expect(ids(result.shownBills)).toEqual([]);
    });

    // タグ別にも同じ議案が出るが、文脈に渡すのは1件だけにする。
    it("タグ別と受付中で重複する議案は1件にまとめる", () => {
      const result = pickHomeSections({
        ...base,
        billsByTag: [group("暮らし", "intv", "other")],
        interviewOpenBills: [bill("intv")],
      });

      expect(ids(result.shownBills)).toEqual(["intv", "other"]);
    });
  });

  describe("featuredBillIds", () => {
    it("注目の議案IDを返す", () => {
      const result = pickHomeSections({
        ...base,
        featuredBills: [bill("a"), bill("b")],
      });

      expect([...result.featuredBillIds]).toEqual(["a", "b"]);
    });

    it("featuredBills が空なら空", () => {
      const result = pickHomeSections({
        ...base,
        featuredBills: [],
      });

      expect([...result.featuredBillIds]).toEqual([]);
    });
  });
});
