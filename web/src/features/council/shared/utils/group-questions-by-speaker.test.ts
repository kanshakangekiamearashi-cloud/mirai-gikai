import { describe, expect, it } from "vitest";
import type { GeneralQuestion } from "../types";
import { groupQuestionsBySpeaker } from "./group-questions-by-speaker";

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
    answer_source: "議会だよりvol.213",
    answer_status: "summary_published",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("groupQuestionsBySpeaker", () => {
  it("同じ質問者の連続した項目を1グループにまとめる", () => {
    const groups = groupQuestionsBySpeaker([
      makeQuestion({ id: "q1", seq: 1, topic: "項目1" }),
      makeQuestion({ id: "q2", seq: 2, topic: "項目2" }),
      makeQuestion({
        id: "q3",
        seq: 3,
        speaker_name: "佐藤 花子",
        speaker_faction: "会派B",
        asked_on: "2026-09-09",
        topic: "項目3",
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].speakerName).toBe("山田 太郎");
    expect(groups[0].items.map((q) => q.topic)).toEqual(["項目1", "項目2"]);
    expect(groups[1].speakerName).toBe("佐藤 花子");
    expect(groups[1].askedOn).toBe("2026-09-09");
  });

  it("空配列では空の結果を返す", () => {
    expect(groupQuestionsBySpeaker([])).toEqual([]);
  });
});
