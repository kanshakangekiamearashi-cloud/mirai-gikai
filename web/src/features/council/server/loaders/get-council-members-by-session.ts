import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilMemberWithCommittees } from "../../shared/types";
import { attachCommitteesToMembers } from "../../shared/utils/attach-committees-to-members";
import {
  findCouncilCommitteesBySessionId,
  findCouncilMembersBySessionId,
  findMemberCommitteesByCommitteeIds,
} from "../repositories/council-repository";

/**
 * 会期の議員名簿を、委員会所属付きで取得
 */
export async function getCouncilMembersBySessionId(
  sessionId: string
): Promise<CouncilMemberWithCommittees[]> {
  return _getCachedCouncilMembers(sessionId);
}

const _getCachedCouncilMembers = unstable_cache(
  async (sessionId: string): Promise<CouncilMemberWithCommittees[]> => {
    const [members, committees] = await Promise.all([
      findCouncilMembersBySessionId(sessionId),
      findCouncilCommitteesBySessionId(sessionId),
    ]);
    const assignments = await findMemberCommitteesByCommitteeIds(
      committees.map((committee) => committee.id)
    );
    return attachCommitteesToMembers(members, committees, assignments);
  },
  ["council-members-by-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.COUNCIL_MEMBERS],
  }
);
