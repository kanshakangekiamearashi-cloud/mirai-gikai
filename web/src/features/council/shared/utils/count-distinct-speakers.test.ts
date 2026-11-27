import { describe, expect, it } from "vitest";
import type { GeneralQuestion } from "../types";
import { countDistinctSpeakers } from "./count-distinct-speakers";

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
    answer_summary: "要旨",
    answer_detail: null,
    answer_detail_source: null,
    answer_source: "議会だよりvol.213",
    answer_status: "summary_published",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("countDistinctSpeakers", () => {
  it("同じ質問者の複数項目は1名として数える", () => {
    const questions = [
      makeQuestion({ id: "q1", seq: 1 }),
      makeQuestion({ id: "q2", seq: 2 }),
      makeQuestion({ id: "q3", seq: 3, speaker_name: "佐藤 花子" }),
    ];

    expect(countDistinctSpeakers(questions)).toBe(2);
  });

  it("空配列は0を返す", () => {
    expect(countDistinctSpeakers([])).toBe(0);
  });
});
