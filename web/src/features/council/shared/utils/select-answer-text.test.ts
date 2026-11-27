import { describe, expect, it } from "vitest";
import type { GeneralQuestion } from "../types";
import { selectAnswerText } from "./select-answer-text";

function makeQuestion(
  overrides: Partial<GeneralQuestion> = {}
): GeneralQuestion {
  return {
    id: "q1",
    diet_session_id: "s1",
    speaker_name: "山田 太郎",
    speaker_faction: "会派A",
    asked_on: "2026-09-08",
    seq: 1,
    topic: "項目1",
    answer_summary: "要旨テキスト",
    answer_source: "会議録",
    answer_detail: "詳細テキスト",
    answer_detail_source: "会議録",
    answer_status: "summary_published",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("selectAnswerText", () => {
  it("normal では要旨とその出典ラベルを返す", () => {
    const selected = selectAnswerText(makeQuestion(), "normal");
    expect(selected).toEqual({
      text: "要旨テキスト",
      label: "答弁要旨（会議録）",
      isDetail: false,
    });
  });

  it("hard かつ詳細版がある項目では詳細版と詳細ラベルを返す", () => {
    const selected = selectAnswerText(makeQuestion(), "hard");
    expect(selected).toEqual({
      text: "詳細テキスト",
      label: "答弁の詳しい記録（会議録）",
      isDetail: true,
    });
  });

  it("hard でも詳細版が無い項目では要旨を返す", () => {
    const selected = selectAnswerText(
      makeQuestion({ answer_detail: null, answer_detail_source: null }),
      "hard"
    );
    expect(selected).toEqual({
      text: "要旨テキスト",
      label: "答弁要旨（会議録）",
      isDetail: false,
    });
  });

  it("要旨が未公表の項目は難易度によらず null を返す", () => {
    const unpublished = makeQuestion({
      answer_status: "not_published",
      answer_summary: null,
      answer_source: null,
      answer_detail: null,
      answer_detail_source: null,
    });
    expect(selectAnswerText(unpublished, "normal")).toBeNull();
    expect(selectAnswerText(unpublished, "hard")).toBeNull();
  });
});
