import "server-only";

import { getBillDigestEntries } from "@/features/bills/server/loaders/get-bill-digest-entries";
import { getCurrentDietSession } from "@/features/diet-sessions/server/loaders/get-current-diet-session";
import { getDietSessionsBefore } from "@/features/diet-sessions/server/loaders/get-diet-sessions-before";
import { getLatestClosedDietSession } from "@/features/diet-sessions/server/loaders/get-latest-closed-diet-session";
import type { DietSession } from "@/features/diet-sessions/shared/types";
import { getJapanTime } from "@/lib/utils/date";
import type {
  CouncilBillDigestEntry,
  CouncilCommitteeDigestEntry,
} from "../../shared/types";
import { buildMultiSessionCouncilDigest } from "../../shared/utils/build-council-digest";
import { getCouncilCommitteesForDigest } from "./get-council-committees-for-digest";
import { getCouncilMembersBySessionId } from "./get-council-members-by-session";
import { getGeneralQuestionsBySessionId } from "./get-general-questions-by-session";

/**
 * トップページ用チャットに渡す、一般質問・議案・議員名簿・委員会の
 * ダイジェストを取得する。
 *
 * 一般質問と議案は、基準会期（開催中の会期、無ければ直近に閉会した会期）
 * とそれより前の全会期を新しい順に対象にする。どのページの文脈で聞かれても
 * 収録済みの会期すべてから答えられるようにするため。
 * 議員名簿と委員会は基準会期分のみ（収録がその会期分しかないため）。
 * 基準会期が無い場合は空文字列を返す。
 */
export async function getCouncilChatDigest(): Promise<string> {
  const now = getJapanTime();
  const targetSession =
    (await getCurrentDietSession(now)) ??
    (await getLatestClosedDietSession(now));
  if (!targetSession) {
    return "";
  }

  const [pastSessions, members, committees] = await Promise.all([
    getDietSessionsBefore(targetSession.start_date),
    getCouncilMembersBySessionId(targetSession.id),
    // 委員会の取得に失敗してもチャット自体は止めない。
    // 委員会セクションなしのダイジェストを返す。
    fetchCommitteesSafely(targetSession.id),
  ]);

  const sessions: DietSession[] = [targetSession, ...pastSessions];
  const sessionData = await Promise.all(
    sessions.map(async (session) => ({
      sessionName: session.name,
      questions: await getGeneralQuestionsBySessionId(session.id),
      // 議案の取得に失敗した会期は、一般質問のみでダイジェストに含める。
      bills: await fetchBillsSafely(session.id),
    }))
  );

  return buildMultiSessionCouncilDigest(
    sessionData,
    members,
    committees,
    targetSession.name
  );
}

async function fetchCommitteesSafely(
  sessionId: string
): Promise<CouncilCommitteeDigestEntry[]> {
  try {
    return await getCouncilCommitteesForDigest(sessionId);
  } catch (error) {
    console.error("Failed to fetch council committees for chat digest:", error);
    return [];
  }
}

async function fetchBillsSafely(
  sessionId: string
): Promise<CouncilBillDigestEntry[]> {
  try {
    return await getBillDigestEntries(sessionId);
  } catch (error) {
    console.error("Failed to fetch bill digest entries:", error);
    return [];
  }
}
