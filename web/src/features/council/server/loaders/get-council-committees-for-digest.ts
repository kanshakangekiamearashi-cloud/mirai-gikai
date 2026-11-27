import "server-only";

import type { CouncilCommitteeDigestEntry } from "../../shared/types";
import {
  findCouncilCommitteesBySessionId,
  findCouncilMembersBySessionId,
  findMemberCommitteesByCommitteeIds,
} from "../repositories/council-repository";

/**
 * 会期の委員会を、チャット用ダイジェストに渡せる形で取得する。
 *
 * 委員会は掲載順（seq）に並べ、各委員会では委員長・副委員長を役職で拾い、
 * それ以外の委員は所属の掲載順に名前だけを並べる。役職が記録されて
 * いない委員会ではその断片を null のままにし、推測で埋めない
 * （attach-committees-to-members と同じ役職値 chair / vice_chair / member を使う）。
 */
export async function getCouncilCommitteesForDigest(
  sessionId: string
): Promise<CouncilCommitteeDigestEntry[]> {
  const [committees, members] = await Promise.all([
    findCouncilCommitteesBySessionId(sessionId),
    findCouncilMembersBySessionId(sessionId),
  ]);
  if (committees.length === 0) {
    return [];
  }

  const assignments = await findMemberCommitteesByCommitteeIds(
    committees.map((committee) => committee.id)
  );

  const memberNameById = new Map(members.map((member) => [member.id, member.name]));

  return committees.map((committee) => {
    const committeeAssignments = assignments
      .filter((assignment) => assignment.council_committee_id === committee.id)
      .sort((a, b) => a.seq - b.seq);

    let chairName: string | null = null;
    let viceChairName: string | null = null;
    const memberNames: string[] = [];
    for (const assignment of committeeAssignments) {
      const name = memberNameById.get(assignment.council_member_id);
      if (!name) {
        continue;
      }
      if (assignment.role === "chair") {
        chairName ??= name;
      } else if (assignment.role === "vice_chair") {
        viceChairName ??= name;
      } else {
        memberNames.push(name);
      }
    }

    return {
      name: committee.name,
      seq: committee.seq,
      chairName,
      viceChairName,
      memberNames,
    };
  });
}
