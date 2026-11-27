import { getBillsByFeaturedTags } from "@/features/bills/server/loaders/get-bills-by-featured-tags";
import { getComingSoonBills } from "./get-coming-soon-bills";
import { getInterviewOpenBills } from "./get-interview-open-bills";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 *
 * 過去の会期の議案は「過去の定例会」セクション（council 側のローダー）が
 * 担うため、本家の前回会期・過去会期一覧のデータはここでは取得しない。
 */
export async function loadHomeData() {
  const [billsByTag, interviewOpenBills, comingSoonBills] = await Promise.all([
    getBillsByFeaturedTags(),
    getInterviewOpenBills(),
    getComingSoonBills(),
  ]);

  return {
    billsByTag,
    interviewOpenBills,
    comingSoonBills,
  };
}
