import type { BillWithContent } from "../../../shared/types";
import { findBillPlainSummaries } from "../../repositories/bill-repository";

/**
 * 議案の配列に「ふつう」（normal）難易度の要約（plain_summary）を一括で付与する
 *
 * カードと詳細の見出しは選択中の難易度によらず normal の要約で統一するため、
 * 各ローダーが難易度別のコンテンツとは別にこの要約を付ける。
 * normal の要約が無い議案は null を付与する。
 */
export async function attachPlainSummaries<T extends BillWithContent>(
  bills: T[]
): Promise<T[]> {
  if (bills.length === 0) {
    return bills;
  }

  const summaries = await findBillPlainSummaries(bills.map((bill) => bill.id));

  return bills.map((bill) => ({
    ...bill,
    plain_summary: summaries.get(bill.id) ?? null,
  }));
}
