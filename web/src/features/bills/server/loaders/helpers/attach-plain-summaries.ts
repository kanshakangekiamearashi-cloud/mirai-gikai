import type { BillWithContent } from "../../../shared/types";
import { extractBillExcerpt } from "../../../shared/utils/bill-excerpt";
import { extractBillLead } from "../../../shared/utils/bill-lead";
import { findNormalContentsByBillIds } from "../../repositories/bill-repository";

/**
 * 議案の配列に「ふつう」（normal）難易度の要約（plain_summary）と、
 * 本文から作る冒頭の抜粋（plain_excerpt）・リード文（plain_lead）を
 * 一括で付与する
 *
 * カードと詳細の見出しは選択中の難易度によらず normal の要約で統一するため、
 * 各ローダーが難易度別のコンテンツとは別にこの要約を付ける。
 * カードに出す説明文の抜粋と、詳細に出すリード文も、見出しと同じく
 * normal の本文から作る。
 * normal の行が無い議案はいずれも null を付与する。
 */
export async function attachPlainSummaries<T extends BillWithContent>(
  bills: T[]
): Promise<T[]> {
  if (bills.length === 0) {
    return bills;
  }

  const contents = await findNormalContentsByBillIds(
    bills.map((bill) => bill.id)
  );

  return bills.map((bill) => {
    const normal = contents.get(bill.id);
    return {
      ...bill,
      plain_summary: normal?.summary ?? null,
      plain_excerpt: extractBillExcerpt(normal?.content, {
        heading: normal?.summary,
      }),
      plain_lead: extractBillLead(normal?.content, {
        heading: normal?.summary,
      }),
    };
  });
}
