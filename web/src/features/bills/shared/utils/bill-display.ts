import type { BillWithContent } from "../types";

type BillDisplaySource = Pick<
  BillWithContent,
  "name" | "bill_content" | "plain_summary"
>;

/**
 * カードと詳細ページの見出しに使う文。
 *
 * 本家（チームみらい）の型に合わせ、見出しは正式名称ではなく、やさしい一文
 * （「ふつう」難易度の要約）にする。難易度が「難しい」でも見出しは変えない。
 * 「難しい」の要約は「審議結果：…」という結果の行で、見出しにはならないため。
 *
 * plain_summary が無い経路（プレビュー等）では、表示中コンテンツが「ふつう」
 * ならその要約を、それ以外は件名→正式名称の順に落とす。
 */
export function getBillHeading(bill: BillDisplaySource): string {
  if (bill.plain_summary) {
    return bill.plain_summary;
  }
  const content = bill.bill_content;
  if (content?.difficulty_level === "normal" && content.summary) {
    return content.summary;
  }
  return content?.title ?? bill.name;
}

/**
 * 見出しの下に小さく出す正式な件名。
 *
 * 見出し（やさしい一文）と同一になる場合は null を返し、重複を出さない。
 */
export function getBillSubTitle(bill: BillDisplaySource): string | null {
  const official = bill.bill_content?.title ?? bill.name;
  return official !== getBillHeading(bill) ? official : null;
}
