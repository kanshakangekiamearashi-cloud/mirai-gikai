import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { GeneralQuestion } from "../../shared/types";
import { findGeneralQuestionsBySessionId } from "../repositories/council-repository";

/**
 * 会期の一般質問一覧を取得
 */
export async function getGeneralQuestionsBySessionId(
  sessionId: string
): Promise<GeneralQuestion[]> {
  return _getCachedGeneralQuestions(sessionId);
}

const _getCachedGeneralQuestions = unstable_cache(
  async (sessionId: string): Promise<GeneralQuestion[]> => {
    return findGeneralQuestionsBySessionId(sessionId);
  },
  ["general-questions-by-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.GENERAL_QUESTIONS],
  }
);
