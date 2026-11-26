import { describe, expect, it } from "vitest";
import type {
  CouncilCommittee,
  CouncilMember,
  CouncilMemberCommittee,
} from "../types";
import { attachCommitteesToMembers } from "./attach-committees-to-members";

function makeMember(
  overrides: Partial<CouncilMember> = {}
): CouncilMember {
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

function makeCommittee(
  overrides: Partial<CouncilCommittee> = {}
): CouncilCommittee {
  return {
    id: "c1",
    diet_session_id: "s1",
    name: "総務委員会",
    category: "常任委員会",
    as_of: "令和7年6月27日現在",
    seq: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeAssignment(
  overrides: Partial<CouncilMemberCommittee> = {}
): CouncilMemberCommittee {
  return {
    id: "a1",
    council_committee_id: "c1",
    council_member_id: "m1",
    role: "member",
    seq: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("attachCommitteesToMembers", () => {
  it("議員に委員会名と役職を付ける", () => {
    const result = attachCommitteesToMembers(
      [makeMember()],
      [makeCommittee()],
      [makeAssignment({ role: "chair" })]
    );

    expect(result).toHaveLength(1);
    expect(result[0].committees).toEqual([
      { name: "総務委員会", role: "chair" },
    ]);
  });

  it("委員会は公式ページの掲載順（seq）に並べ、入力順に依存しない", () => {
    const committees = [
      makeCommittee({ id: "c2", name: "議会運営委員会", seq: 2 }),
      makeCommittee({ id: "c1", name: "総務委員会", seq: 1 }),
    ];
    const assignments = [
      makeAssignment({ id: "a2", council_committee_id: "c2" }),
      makeAssignment({ id: "a1", council_committee_id: "c1" }),
    ];

    const result = attachCommitteesToMembers(
      [makeMember()],
      committees,
      assignments
    );

    expect(result[0].committees.map((c) => c.name)).toEqual([
      "総務委員会",
      "議会運営委員会",
    ]);
  });

  it("所属が無い議員には空配列を付け、議員の入力順を保つ", () => {
    const members = [
      makeMember({ id: "m2", name: "佐藤 花子", seq: 2 }),
      makeMember({ id: "m1", seq: 1 }),
    ];

    const result = attachCommitteesToMembers(
      members,
      [makeCommittee()],
      [makeAssignment()]
    );

    expect(result.map((m) => m.id)).toEqual(["m2", "m1"]);
    expect(result[0].committees).toEqual([]);
    expect(result[1].committees).toHaveLength(1);
  });

  it("存在しない委員会への所属は無視する", () => {
    const result = attachCommitteesToMembers(
      [makeMember()],
      [makeCommittee()],
      [makeAssignment({ council_committee_id: "unknown" })]
    );

    expect(result[0].committees).toEqual([]);
  });

  it("所属が空の場合は全員に空配列を付ける", () => {
    const result = attachCommitteesToMembers(
      [makeMember(), makeMember({ id: "m2", seq: 2 })],
      [makeCommittee()],
      []
    );

    expect(result.every((m) => m.committees.length === 0)).toBe(true);
  });
});
