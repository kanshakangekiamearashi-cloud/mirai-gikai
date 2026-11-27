import "server-only";

import { unstable_cache } from "next/cache";
import { findBillIdsWithCommitteeQa } from "@/features/council/server/repositories/council-repository";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../../shared/types";
import { hasSplitVote } from "../../shared/utils/detect-split-vote";
import { findNormalContentsByBillIds } from "../repositories/bill-repository";
import { getBillsByDietSession } from "./get-bills-by-diet-session";

/**
 * 委員会質疑がある議案のID取得のキャッシュ。
 *
 * unstable_cache は Set を返せないので配列で保存し、呼び出し側で戻す。
 */
const getCachedBillIdsWithCommitteeQa = unstable_cache(
  async (billIds: string[]) => {
    const ids = await findBillIdsWithCommitteeQa(billIds);
    return [...ids];
  },
  ["notable-bill-qa-ids"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS, CACHE_TAGS.COMMITTEE_QA],
  }
);

/**
 * 「ふつう」（normal）難易度のコンテンツ取得のキャッシュ。
 *
 * unstable_cache は Map を返せないのでエントリー配列で保存し、呼び出し側で戻す。
 */
const getCachedNormalContents = unstable_cache(
  async (billIds: string[]) => {
    const contents = await findNormalContentsByBillIds(billIds);
    return [...contents.entries()];
  },
  ["notable-bill-normal-contents"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);

/**
 * 会期内の「注目」議案を取得する
 *
 * 賛否が分かれた議案と、委員会で質疑があった議案を「注目」とする。
 * is_featured フラグは使わず、データ（採決結果と委員会質疑の有無）から決める。
 *
 * 賛否の判定は選択中の難易度によらず「ふつう」の本文で行う。
 * 会期の議案一覧は getBillsByDietSession（難易度 cookie と自前のキャッシュを
 * 持つ）から取得し、その並び順を保ったまま絞り込む。
 */
export async function getNotableBills(
  dietSessionId: string
): Promise<BillWithContent[]> {
  const bills = await getBillsByDietSession(dietSessionId);

  if (bills.length === 0) {
    return [];
  }

  const billIds = bills.map((bill) => bill.id);
  const [qaBillIdList, normalContentEntries] = await Promise.all([
    getCachedBillIdsWithCommitteeQa(billIds),
    getCachedNormalContents(billIds),
  ]);

  const qaBillIds = new Set(qaBillIdList);
  const normalContents = new Map(normalContentEntries);

  return bills.filter((bill) => {
    if (qaBillIds.has(bill.id)) {
      return true;
    }
    return hasSplitVote(normalContents.get(bill.id)?.content);
  });
}
