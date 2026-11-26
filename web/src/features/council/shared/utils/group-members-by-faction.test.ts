import { describe, expect, it } from "vitest";
import type { CouncilMember } from "../types";
import { groupMembersByFaction } from "./group-members-by-faction";

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

describe("groupMembersByFaction", () => {
  it("会派の初出順を保ちながらグループ化する", () => {
    const groups = groupMembersByFaction([
      makeMember({ id: "m1", name: "山田 太郎", faction: "会派A", seq: 1 }),
      makeMember({ id: "m2", name: "佐藤 花子", faction: "会派B", seq: 2 }),
      makeMember({ id: "m3", name: "鈴木 一郎", faction: "会派A", seq: 3 }),
    ]);

    expect(groups.map((g) => g.faction)).toEqual(["会派A", "会派B"]);
    expect(groups[0].members.map((m) => m.name)).toEqual([
      "山田 太郎",
      "鈴木 一郎",
    ]);
    expect(groups[1].members).toHaveLength(1);
  });

  it("空配列では空の結果を返す", () => {
    expect(groupMembersByFaction([])).toEqual([]);
  });
});
