import "server-only";

import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { getDietSessionsBefore } from "@/features/diet-sessions/server/loaders/get-diet-sessions-before";
import type {
  DietSession,
  SluggedDietSession,
} from "@/features/diet-sessions/shared/types";
import {
  type CouncilSessionSummary,
  getCouncilSessionSummary,
} from "./get-council-session-summary";

export type PastCouncilSessionEntry = {
  session: SluggedDietSession;
  summary: CouncilSessionSummary;
};

/**
 * トップページの「過去の定例会」セクション用に、入口に出している会期より
 * 前の会期とその収録件数を新しい順に取得する。
 *
 * 会期・件数はいずれもDBの実データから求める（入口セクションと同じ
 * getCouncilSessionSummary を使う）。議案も一般質問も収録が無い会期は
 * リンク先が空になるため除外する。
 */
export async function getPastCouncilSessionEntries(
  entrySession: DietSession,
  difficultyLevel: DifficultyLevelEnum
): Promise<PastCouncilSessionEntry[]> {
  const pastSessions = await getDietSessionsBefore(entrySession.start_date);
  const summaries = await Promise.all(
    pastSessions.map((session) =>
      getCouncilSessionSummary(session.id, difficultyLevel)
    )
  );

  return pastSessions
    .map((session, i) => ({ session, summary: summaries[i] }))
    .filter(
      ({ summary }) => summary.billCount > 0 || summary.questionCount > 0
    );
}
