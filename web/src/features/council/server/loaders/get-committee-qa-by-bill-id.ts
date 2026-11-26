import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillCommitteeQa } from "../../shared/types";
import { findCommitteeQaByBillId } from "../repositories/council-repository";

/**
 * 議案の委員会質疑一覧を取得
 */
export async function getCommitteeQaByBillId(
  billId: string
): Promise<BillCommitteeQa[]> {
  return _getCachedCommitteeQa(billId);
}

const _getCachedCommitteeQa = unstable_cache(
  async (billId: string): Promise<BillCommitteeQa[]> => {
    return findCommitteeQaByBillId(billId);
  },
  ["committee-qa-by-bill"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.COMMITTEE_QA],
  }
);
