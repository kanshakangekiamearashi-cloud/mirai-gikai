import { describe, expect, it } from "vitest";
import type { CouncilQuestionVideo } from "../types";
import { indexQuestionVideosBySpeakerDate } from "./index-question-videos";

function video(overrides: Partial<CouncilQuestionVideo>): CouncilQuestionVideo {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    diet_session_id: "session-1",
    speaker_name: "谷 晴美",
    asked_on: "2026-03-04",
    youtube_url: "https://www.youtube.com/watch?v=example",
    video_title: "R080304 第１回定例会（４日目）一般質問（谷 晴美 議員）",
    created_at: "2026-11-28T00:00:00Z",
    updated_at: "2026-11-28T00:00:00Z",
    ...overrides,
  };
}

describe("indexQuestionVideosBySpeakerDate", () => {
  it("質問者名と登壇日のキーで引ける", () => {
    const map = indexQuestionVideosBySpeakerDate([video({})]);
    expect(map.get("谷 晴美|2026-03-04")?.youtube_url).toBe(
      "https://www.youtube.com/watch?v=example"
    );
  });

  it("同じ質問者でも登壇日が違えば別キーになる", () => {
    const map = indexQuestionVideosBySpeakerDate([
      video({ asked_on: "2026-03-04" }),
      video({ asked_on: "2026-06-17", youtube_url: "https://youtu.be/2" }),
    ]);
    expect(map.size).toBe(2);
    expect(map.get("谷 晴美|2026-06-17")?.youtube_url).toBe(
      "https://youtu.be/2"
    );
  });

  it("空配列では空の Map を返す", () => {
    expect(indexQuestionVideosBySpeakerDate([]).size).toBe(0);
  });
});
