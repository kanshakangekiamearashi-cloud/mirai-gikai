import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilQuestionVideo } from "../../shared/types";
import { findQuestionVideosBySessionId } from "../repositories/council-repository";

/**
 * 会期の一般質問・代表質問の公式動画リンクを取得
 */
export async function getQuestionVideosBySessionId(
  sessionId: string
): Promise<CouncilQuestionVideo[]> {
  return _getCachedQuestionVideos(sessionId);
}

const _getCachedQuestionVideos = unstable_cache(
  async (sessionId: string): Promise<CouncilQuestionVideo[]> => {
    return findQuestionVideosBySessionId(sessionId);
  },
  ["question-videos-by-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.GENERAL_QUESTIONS],
  }
);
