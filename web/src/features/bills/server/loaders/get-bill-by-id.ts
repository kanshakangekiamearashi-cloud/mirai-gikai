import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../../shared/types";
import { extractBillLeadDetails } from "../../shared/utils/bill-lead";
import { stripBillLeadDuplication } from "../../shared/utils/bill-lead-strip";
import { hideUnpublishedStance } from "../../shared/utils/hide-unpublished-stance";
import {
  findMiraiStanceByBillId,
  findNormalContentsByBillIds,
  findPublishedBillById,
  findTagsByBillId,
} from "../repositories/bill-repository";
import { getBillContentWithDifficulty } from "./helpers/get-bill-content";

export async function getBillById(id: string): Promise<BillWithContent | null> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();
  const bill = await _getCachedBillById(id, difficultyLevel);
  // 賛否の予約公開はキャッシュ（10分）の外で判定し、公開日時ちょうどに切り替える
  return bill ? hideUnpublishedStance(bill, new Date()) : null;
}

const _getCachedBillById = unstable_cache(
  async (
    id: string,
    difficultyLevel: DifficultyLevelEnum
  ): Promise<BillWithContent | null> => {
    // 基本的なbill情報、見解、コンテンツ、タグを並列取得
    // 公開ステータスの議案のみを取得
    // 見解は公開日時前のものも含めてキャッシュし、呼び出し側で除外する
    const [bill, miraiStance, billContent, billTags] = await Promise.all([
      findPublishedBillById(id),
      findMiraiStanceByBillId(id),
      getBillContentWithDifficulty(id, difficultyLevel),
      findTagsByBillId(id),
    ]);

    if (!bill) {
      console.error("Failed to fetch bill");
      return null;
    }

    // 見出し用の「ふつう」難易度の要約と、リード文の元になる本文を、
    // 選択中の難易度とは別に取得する
    const normalContents = await findNormalContentsByBillIds([id]);
    const normal = normalContents.get(id);
    const leadDetails = extractBillLeadDetails(normal?.content, {
      heading: normal?.summary,
    });

    // タグデータを整形
    const tags =
      billTags
        ?.map((bt) => bt.tags)
        .filter((tag): tag is { id: string; label: string } => tag !== null) ||
      [];

    return {
      ...bill,
      plain_summary: normal?.summary ?? null,
      plain_lead: leadDetails?.lead ?? null,
      mirai_stance: miraiStance || undefined,
      // リード文は「ふつう」本文の冒頭から作るため、表示する本文からは
      // リードと重なる冒頭の文を取り除く（保存データは書き換えない）。
      // 「むずかしい」本文は冒頭がリードと一致せず、実際には変わらない。
      bill_content: billContent
        ? {
            ...billContent,
            content:
              leadDetails && billContent.content
                ? stripBillLeadDuplication(
                    billContent.content,
                    leadDetails.sentences
                  )
                : billContent.content,
          }
        : undefined,
      tags,
    };
  },
  ["bill-by-id"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
