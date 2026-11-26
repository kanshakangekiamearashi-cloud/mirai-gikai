import "server-only";

import { getCurrentDietSession } from "@/features/diet-sessions/server/loaders/get-current-diet-session";
import { getLatestClosedDietSession } from "@/features/diet-sessions/server/loaders/get-latest-closed-diet-session";
import { getJapanTime } from "@/lib/utils/date";
import { buildCouncilDigest } from "../../shared/utils/build-council-digest";
import { getCouncilMembersBySessionId } from "./get-council-members-by-session";
import { getGeneralQuestionsBySessionId } from "./get-general-questions-by-session";

/**
 * トップページ用チャットに渡す、一般質問・議員名簿のダイジェストを取得する。
 *
 * 対象会期はトップページの会期入口セクションと同じ
 * （開催中の会期、無ければ直近に閉会した会期）。
 * 対象会期が無い、または収録データが無い場合は空文字列を返す。
 */
export async function getCouncilChatDigest(): Promise<string> {
  const now = getJapanTime();
  const session =
    (await getCurrentDietSession(now)) ??
    (await getLatestClosedDietSession(now));
  if (!session) {
    return "";
  }

  const [questions, members] = await Promise.all([
    getGeneralQuestionsBySessionId(session.id),
    getCouncilMembersBySessionId(session.id),
  ]);

  return buildCouncilDigest(questions, members);
}
