import type {
  CouncilCommittee,
  CouncilMember,
  CouncilMemberCommittee,
  CouncilMemberWithCommittees,
  MemberCommitteeAssignment,
} from "../types";

/**
 * 議員名簿に委員会所属を付け加える純粋関数。
 *
 * 委員会の並びは公式ページの掲載順（council_committees.seq）を優先し、
 * 議員の入力順は変更しない。所属が無い議員には空配列を付ける。
 * 公式ページに掲載されていない所属は入力にも存在しない前提で、
 * ここで新たに作ることはしない。
 */
export function attachCommitteesToMembers(
  members: CouncilMember[],
  committees: CouncilCommittee[],
  assignments: CouncilMemberCommittee[]
): CouncilMemberWithCommittees[] {
  const committeeById = new Map(committees.map((c) => [c.id, c]));
  const byMemberId = new Map<string, MemberCommitteeAssignment[]>();

  const sortedAssignments = [...assignments].sort((a, b) => {
    const committeeA = committeeById.get(a.council_committee_id);
    const committeeB = committeeById.get(b.council_committee_id);
    const committeeOrder =
      (committeeA?.seq ?? Number.MAX_SAFE_INTEGER) -
      (committeeB?.seq ?? Number.MAX_SAFE_INTEGER);
    return committeeOrder !== 0 ? committeeOrder : a.seq - b.seq;
  });

  for (const assignment of sortedAssignments) {
    const committee = committeeById.get(assignment.council_committee_id);
    if (!committee) {
      continue;
    }
    const list = byMemberId.get(assignment.council_member_id) ?? [];
    list.push({ name: committee.name, role: assignment.role });
    byMemberId.set(assignment.council_member_id, list);
  }

  return members.map((member) => ({
    ...member,
    committees: byMemberId.get(member.id) ?? [],
  }));
}
