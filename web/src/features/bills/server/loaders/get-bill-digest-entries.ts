import "server-only";

import { unstable_cache } from "next/cache";
import type { CouncilBillDigestEntry } from "@/features/council/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getCardStatusLabel } from "../../shared/utils/bill-status";
import {
  findBillPlainSummaries,
  findPublishedBillDigestRowsByDietSession,
} from "../repositories/bill-repository";

/**
 * 会期の公開済み議案を、チャット用ダイジェスト向けの見出しレベル
 * （正式名称・平易な見出し・審議結果の文言）で取得する。
 *
 * 審議結果の文言は status_note（議案ページに表示される結果表記）を優先し、
 * 無い議案だけステータスの簡略ラベルで補う。
 */
export async function getBillDigestEntries(
  dietSessionId: string
): Promise<CouncilBillDigestEntry[]> {
  return _getCachedBillDigestEntries(dietSessionId);
}

const _getCachedBillDigestEntries = unstable_cache(
  async (dietSessionId: string): Promise<CouncilBillDigestEntry[]> => {
    const rows = await findPublishedBillDigestRowsByDietSession(dietSessionId);
    if (rows.length === 0) {
      return [];
    }

    const plainHeadings = await findBillPlainSummaries(
      rows.map((row) => row.id)
    );

    return rows.map((row) => ({
      name: row.name,
      plainHeading: plainHeadings.get(row.id) ?? null,
      statusLabel: row.status_note ?? getCardStatusLabel(row.status),
    }));
  },
  ["bill-digest-entries-by-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.BILLS],
  }
);
