import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilMember } from "../../shared/types";
import { findCouncilMembersBySessionId } from "../repositories/council-repository";

/**
 * 会期の議員名簿を取得
 */
export async function getCouncilMembersBySessionId(
  sessionId: string
): Promise<CouncilMember[]> {
  return _getCachedCouncilMembers(sessionId);
}

const _getCachedCouncilMembers = unstable_cache(
  async (sessionId: string): Promise<CouncilMember[]> => {
    return findCouncilMembersBySessionId(sessionId);
  },
  ["council-members-by-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.COUNCIL_MEMBERS],
  }
);
