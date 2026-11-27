import { describe, expect, it } from "vitest";
import { hasSplitVote } from "./detect-split-vote";

describe("hasSplitVote", () => {
  it("賛成・反対の人数が併記されていれば true", () => {
    expect(hasSplitVote("賛成26・反対1・欠席1")).toBe(true);
  });

  it("全角数字でも true", () => {
    expect(hasSplitVote("賛成２６・反対１")).toBe(true);
  });

  it("人数のない「賛成多数」は false", () => {
    expect(hasSplitVote("賛成多数で原案可決")).toBe(false);
  });

  it("「全会一致」は false", () => {
    expect(hasSplitVote("全会一致")).toBe(false);
  });

  it("空文字・null・undefined は false", () => {
    expect(hasSplitVote("")).toBe(false);
    expect(hasSplitVote(null)).toBe(false);
    expect(hasSplitVote(undefined)).toBe(false);
  });
});
