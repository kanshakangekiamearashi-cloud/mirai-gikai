import { describe, expect, it } from "vitest";
import type {
  CouncilBillDigestEntry,
  CouncilCommitteeDigestEntry,
  CouncilMember,
  CouncilSessionDigestData,
  GeneralQuestion,
} from "../types";
import {
  buildCouncilDigest,
  buildMultiSessionCouncilDigest,
} from "./build-council-digest";

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

function makeMember(overrides: Partial<CouncilMember> = {}): CouncilMember {
  return {
    id: "m1",
    diet_session_id: "s1",
    name: "山田 太郎",
    reading: "やまだ たろう",
    faction: "会派A",
    role: "member",
    seq: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

/**
 * 実データと同じ規模の一般質問フィクスチャを作る。
 * 質問者21名・全40項目（先頭19名が2項目、残り2名が1項目）、
 * うち30項目が答弁要旨公表済み、10項目が未公表。
 */
function makeSessionQuestions(): GeneralQuestion[] {
  const questions: GeneralQuestion[] = [];
  let seq = 0;
  for (let speaker = 1; speaker <= 21; speaker++) {
    const itemCount = speaker <= 19 ? 2 : 1;
    for (let item = 0; item < itemCount; item++) {
      seq += 1;
      const published = seq <= 30;
      questions.push(
        makeQuestion({
          id: `q${seq}`,
          seq,
          speaker_name: `質問者${speaker}`,
          speaker_faction: `会派${((speaker - 1) % 3) + 1}`,
          topic: `質問項目${seq}`,
          answer_summary: published ? `答弁要旨${seq}` : null,
          answer_source: published ? "議会だよりvol.213" : null,
          answer_status: published ? "summary_published" : "not_published",
        })
      );
    }
  }
  return questions;
}

/**
 * 実データと同じ規模の議員名簿フィクスチャを作る。
 * 全29名・8会派（7,6,5,3,3,2,2,1名）、議長と副議長を含む。
 */
function makeSessionMembers(): CouncilMember[] {
  const factionSizes = [7, 6, 5, 3, 3, 2, 2, 1];
  const members: CouncilMember[] = [];
  let seq = 0;
  factionSizes.forEach((size, factionIndex) => {
    for (let i = 0; i < size; i++) {
      seq += 1;
      members.push(
        makeMember({
          id: `m${seq}`,
          seq,
          name: `議員${seq}`,
          faction: `会派${factionIndex + 1}`,
          role: seq === 1 ? "chair" : seq === 8 ? "vice_chair" : "member",
        })
      );
    }
  });
  return members;
}

function makeCommittee(
  overrides: Partial<CouncilCommitteeDigestEntry> = {}
): CouncilCommitteeDigestEntry {
  return {
    name: "総務委員会",
    seq: 1,
    chairName: "佐藤 太郎",
    viceChairName: "鈴木 花子",
    memberNames: ["田中 一郎", "高橋 二郎"],
    ...overrides,
  };
}

describe("buildCouncilDigest", () => {
  it("一般質問の総数（質問者数・項目数）を見出しに含める", () => {
    const digest = buildCouncilDigest(makeSessionQuestions(), []);

    expect(digest).toContain("一般質問（質問者21名・全40項目、登壇順）");
  });

  it("質問者を登壇順に並べ、全項目のタイトルを含む", () => {
    const digest = buildCouncilDigest(makeSessionQuestions(), []);

    const first = digest.indexOf("1. 質問者1（");
    const second = digest.indexOf("2. 質問者2（");
    const last = digest.indexOf("21. 質問者21（");
    expect(first).toBeGreaterThanOrEqual(0);
    expect(second).toBeGreaterThan(first);
    expect(last).toBeGreaterThan(second);

    const topicLines = digest
      .split("\n")
      .filter((line) => line.startsWith("- 質問項目"));
    expect(topicLines).toHaveLength(40);
  });

  it("公表済みの答弁要旨は全文含め、未公表の項目にはマーカーを付ける", () => {
    const digest = buildCouncilDigest(makeSessionQuestions(), []);

    const summaryLines = digest
      .split("\n")
      .filter((line) => line.startsWith("  答弁要旨："));
    expect(summaryLines).toHaveLength(30);
    expect(digest).toContain("答弁要旨1");
    expect(digest).toContain("答弁要旨30");

    const unpublishedCount = digest.split("（答弁要旨は未公表）").length - 1;
    expect(unpublishedCount).toBe(10);
    expect(digest).toContain("- 質問項目40（答弁要旨は未公表）");
  });

  it("議員名簿は総数・議長副議長・会派別（合計29名）を含む", () => {
    const digest = buildCouncilDigest([], makeSessionMembers());

    expect(digest).toContain("議員名簿（全29名）");
    expect(digest).toContain("議長：議員1／副議長：議員8");

    const factionLines = digest
      .split("\n")
      .filter((line) => line.startsWith("- 会派"));
    expect(factionLines).toHaveLength(8);

    const totalByFaction = factionLines.reduce((sum, line) => {
      const match = line.match(/（(\d+)名）：/);
      return sum + (match ? Number(match[1]) : 0);
    }, 0);
    expect(totalByFaction).toBe(29);

    const listedNames = factionLines.flatMap((line) =>
      line
        .split("：")[1]
        .split("、")
        .map((name) => name.trim())
    );
    expect(listedNames).toHaveLength(29);
    expect(listedNames).toContain("議員29");
  });

  it("一般質問と議員名簿の両方を含むダイジェストを返す", () => {
    const digest = buildCouncilDigest(
      makeSessionQuestions(),
      makeSessionMembers()
    );

    expect(digest).toContain("一般質問（質問者21名・全40項目、登壇順）");
    expect(digest).toContain("議員名簿（全29名）");
  });

  it("両方とも空の場合は空文字列を返す", () => {
    expect(buildCouncilDigest([], [])).toBe("");
  });

  it("委員会セクションは議員名簿の後に、委員長・副委員長・委員を1行で含める", () => {
    const digest = buildCouncilDigest([], makeSessionMembers(), [
      makeCommittee(),
      makeCommittee({
        name: "文教委員会",
        seq: 2,
        chairName: "佐藤 次郎",
        viceChairName: "鈴木 三郎",
        memberNames: ["田中 四郎"],
      }),
    ]);

    expect(digest).toContain("委員会（全2委員会）");
    expect(digest).toContain(
      "- 総務委員会：委員長 佐藤 太郎、副委員長 鈴木 花子、委員 田中 一郎、高橋 二郎"
    );
    expect(digest).toContain(
      "- 文教委員会：委員長 佐藤 次郎、副委員長 鈴木 三郎、委員 田中 四郎"
    );
    // 委員会セクションは議員名簿セクションより後に出る
    expect(digest.indexOf("委員会（全2委員会）")).toBeGreaterThan(
      digest.indexOf("議員名簿（全29名）")
    );
  });

  it("委員会は seq 順に並べる", () => {
    const digest = buildCouncilDigest(
      [],
      [],
      [
        makeCommittee({ name: "文教委員会", seq: 2 }),
        makeCommittee({ name: "総務委員会", seq: 1 }),
      ]
    );

    expect(digest.indexOf("- 総務委員会")).toBeLessThan(
      digest.indexOf("- 文教委員会")
    );
  });

  it("委員長が記録されていない委員会では委員長の断片を省略する", () => {
    const digest = buildCouncilDigest(
      [],
      [],
      [makeCommittee({ chairName: null })]
    );

    const line = digest.split("\n").find((l) => l.startsWith("- 総務委員会"));
    expect(line).toBe(
      "- 総務委員会：副委員長 鈴木 花子、委員 田中 一郎、高橋 二郎"
    );
    // 副委員長にも「委員長」の文字列が含まれるため、委員会名の直後に
    // 委員長の役職として出ていないことだけを見る
    expect(line?.startsWith("- 総務委員会：委員長")).toBe(false);
  });

  it("副委員長も委員もいない委員会では名前だけの行になる", () => {
    const digest = buildCouncilDigest(
      [],
      [],
      [makeCommittee({ viceChairName: null, memberNames: [] })]
    );

    expect(digest).toContain("- 総務委員会：委員長 佐藤 太郎");
  });

  it("委員会が空の場合は委員会セクションを省略する", () => {
    const digest = buildCouncilDigest(
      makeSessionQuestions(),
      makeSessionMembers(),
      []
    );

    expect(digest).not.toContain("委員会（");
    // 引数自体を省略した場合も同じ
    expect(buildCouncilDigest([], makeSessionMembers())).not.toContain(
      "委員会（"
    );
  });

  it("片方だけの場合はそのセクションだけを返す", () => {
    const questionsOnly = buildCouncilDigest(makeSessionQuestions(), []);
    expect(questionsOnly).toContain("一般質問");
    expect(questionsOnly).not.toContain("議員名簿");

    const membersOnly = buildCouncilDigest([], makeSessionMembers());
    expect(membersOnly).toContain("議員名簿");
    expect(membersOnly).not.toContain("一般質問");
  });
});

function makeBill(
  overrides: Partial<CouncilBillDigestEntry> = {}
): CouncilBillDigestEntry {
  return {
    name: "議案第1号 テスト条例の一部改正について",
    plainHeading: "テスト条例の一部を変える議案",
    statusLabel: "原案可決",
    ...overrides,
  };
}

function makeSessionData(
  overrides: Partial<CouncilSessionDigestData> = {}
): CouncilSessionDigestData {
  return {
    sessionName: "令和8年第3回定例会",
    questions: [],
    bills: [],
    ...overrides,
  };
}

describe("buildMultiSessionCouncilDigest", () => {
  it("収録会期を冒頭に示し、会期ごとに見出しで区切って新しい順に並べる", () => {
    const digest = buildMultiSessionCouncilDigest(
      [
        makeSessionData({
          sessionName: "令和8年第3回定例会",
          questions: [makeQuestion()],
        }),
        makeSessionData({
          sessionName: "令和8年第2回定例会",
          questions: [makeQuestion({ id: "q2", topic: "第2回の項目" })],
        }),
        makeSessionData({
          sessionName: "令和8年第1回定例会",
          questions: [makeQuestion({ id: "q3", topic: "第1回の項目" })],
        }),
      ],
      []
    );

    expect(digest).toContain(
      "収録会期：令和8年第3回定例会、令和8年第2回定例会、令和8年第1回定例会（新しい順）"
    );
    const third = digest.indexOf("### 令和8年第3回定例会");
    const second = digest.indexOf("### 令和8年第2回定例会");
    const first = digest.indexOf("### 令和8年第1回定例会");
    expect(third).toBeGreaterThanOrEqual(0);
    expect(second).toBeGreaterThan(third);
    expect(first).toBeGreaterThan(second);
    // 会期内の一般質問は小見出しになる
    expect(digest).toContain("#### 一般質問（質問者1名・全1項目、登壇順）");
    expect(digest).toContain("第2回の項目");
    expect(digest).toContain("第1回の項目");
  });

  it("議案は正式名称・平易な見出し・審議結果を1行で含める", () => {
    const digest = buildMultiSessionCouncilDigest(
      [
        makeSessionData({
          bills: [
            makeBill(),
            makeBill({
              name: "報告第2号 専決処分の報告について",
              plainHeading: null,
              statusLabel: "報告（議決対象外）",
            }),
          ],
        }),
      ],
      []
    );

    expect(digest).toContain("#### 議案（全2件）");
    expect(digest).toContain(
      "- 議案第1号 テスト条例の一部改正について｜テスト条例の一部を変える議案｜原案可決"
    );
    // 平易な見出しが無い議案は正式名称と審議結果だけの行になる
    expect(digest).toContain(
      "- 報告第2号 専決処分の報告について｜報告（議決対象外）"
    );
  });

  it("一般質問も議案も無い会期は丸ごと省略する", () => {
    const digest = buildMultiSessionCouncilDigest(
      [
        makeSessionData({
          sessionName: "令和8年第3回定例会",
          bills: [makeBill()],
        }),
        makeSessionData({ sessionName: "令和8年第2回定例会" }),
        makeSessionData({
          sessionName: "令和8年第1回定例会",
          questions: [makeQuestion()],
        }),
      ],
      []
    );

    expect(digest).not.toContain("令和8年第2回定例会");
    expect(digest).toContain(
      "収録会期：令和8年第3回定例会、令和8年第1回定例会（新しい順）"
    );
  });

  it("議員名簿と委員会には対象会期名を併記する", () => {
    const digest = buildMultiSessionCouncilDigest(
      [makeSessionData({ questions: [makeQuestion()] })],
      makeSessionMembers(),
      [makeCommittee()],
      "令和8年第3回定例会"
    );

    expect(digest).toContain("議員名簿（令和8年第3回定例会・全29名）");
    expect(digest).toContain("委員会（令和8年第3回定例会・全1委員会）");
    expect(digest).toContain("議長：議員1／副議長：議員8");
    expect(digest).toContain("- 総務委員会：委員長 佐藤 太郎");
  });

  it("会期名を渡さなければ議員名簿・委員会は従来の見出しになる", () => {
    const digest = buildMultiSessionCouncilDigest([], makeSessionMembers(), [
      makeCommittee(),
    ]);

    expect(digest).toContain("議員名簿（全29名）");
    expect(digest).toContain("委員会（全1委員会）");
  });

  it("すべて空の場合は空文字列を返す", () => {
    expect(buildMultiSessionCouncilDigest([], [])).toBe("");
    expect(buildMultiSessionCouncilDigest([makeSessionData()], [])).toBe("");
  });
});
