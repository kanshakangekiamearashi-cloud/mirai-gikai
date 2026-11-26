import "server-only";

import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { getPublishedBillCount } from "@/features/bills/server/loaders/get-published-bill-count";
import { countDistinctSpeakers } from "../../shared/utils/count-distinct-speakers";
import { getCouncilMembersBySessionId } from "./get-council-members-by-session";
import { getGeneralQuestionsBySessionId } from "./get-general-questions-by-session";

export type CouncilSessionSummary = {
  /** 公開議案数 */
  billCount: number;
  /** 一般質問の項目数 */
  questionCount: number;
  /** 一般質問の質問者数 */
  speakerCount: number;
  /** 議員数 */
  memberCount: number;
};

/**
 * トップページの会期入口セクション用に、会期へ紐づく収録件数をまとめて取得する。
 * 件数はいずれもDBの実データから数え、呼び出し側で表示の出し分けに使う。
 */
export async function getCouncilSessionSummary(
  sessionId: string,
  difficultyLevel: DifficultyLevelEnum
): Promise<CouncilSessionSummary> {
  const [billCount, questions, members] = await Promise.all([
    getPublishedBillCount(sessionId, difficultyLevel),
    getGeneralQuestionsBySessionId(sessionId),
    getCouncilMembersBySessionId(sessionId),
  ]);

  return {
    billCount,
    questionCount: questions.length,
    speakerCount: countDistinctSpeakers(questions),
    memberCount: members.length,
  };
}
