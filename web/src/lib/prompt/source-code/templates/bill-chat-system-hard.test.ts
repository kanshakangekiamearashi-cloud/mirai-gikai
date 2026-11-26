import { describe, expect, it } from "vitest";
import { buildBillChatSystemHardPrompt } from "./bill-chat-system-hard";

describe("buildBillChatSystemHardPrompt", () => {
  it("4つのパラメータがプロンプトに埋め込まれる", () => {
    const result = buildBillChatSystemHardPrompt(
      "テスト法案名",
      "テスト法案タイトル",
      "テスト法案要約",
      "テスト法案詳細"
    );

    expect(result).toContain("テスト法案名");
    expect(result).toContain("テスト法案タイトル");
    expect(result).toContain("テスト法案要約");
    expect(result).toContain("テスト法案詳細");
  });

  it("難易度「難しい」セクションが含まれる", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).toContain("回答の難易度：難しい");
    expect(result).toContain("専門用語を正確に使用");
  });

  it("みらい議会＠東広島市の説明が含まれる", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).toContain("みらい議会＠東広島市");
    expect(result).toContain("東広島市議会");
    // 政党の見解は掲載されていない旨が明記される
    expect(result).toContain("政党の見解について");
  });

  it("国会・政党の前提が含まれない", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).not.toContain("安野");
    expect(result).not.toContain("参議院");
    expect(result).not.toContain("国会議員");
  });

  it("knowledgeSource を渡すと <knowledge_source> セクションが含まれる", () => {
    const result = buildBillChatSystemHardPrompt(
      "a",
      "b",
      "c",
      "d",
      "補足知識"
    );

    expect(result).toContain("補足ナレッジ");
    expect(result).toContain("補足知識");
  });

  it("knowledgeSource を省略するとセクションごと出ない", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).not.toContain("<knowledge_source>");
  });
});
