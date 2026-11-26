import type { CouncilMember } from "../types";

export type FactionMemberGroup = {
  faction: string;
  members: CouncilMember[];
};

/**
 * 議員名簿を会派ごとにまとめる純粋関数。
 *
 * 会派の並びは最初に現れた順序を保持し、会派内の議員順も入力順のままにする。
 */
export function groupMembersByFaction(
  members: CouncilMember[]
): FactionMemberGroup[] {
  const groups: FactionMemberGroup[] = [];
  const byFaction = new Map<string, FactionMemberGroup>();
  for (const member of members) {
    let group = byFaction.get(member.faction);
    if (!group) {
      group = { faction: member.faction, members: [] };
      byFaction.set(member.faction, group);
      groups.push(group);
    }
    group.members.push(member);
  }
  return groups;
}
