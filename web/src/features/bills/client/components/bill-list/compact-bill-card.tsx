import Image from "next/image";
import { RubySafeLineClamp } from "@/components/ruby-safe-line-clamp";
import { Card } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { getArticleReviewState } from "../../../shared/utils/article-review-state";
import {
  getBillHeading,
  getBillSubTitle,
} from "../../../shared/utils/bill-display";
import { ReviewCompleteBadge } from "../bill-detail/review-status-banner";
import { BillProposalTypeBadge } from "./bill-proposal-type-badge";
import { BillStatusBadge } from "./bill-status-badge";

interface CompactBillCardProps {
  bill: BillWithContent;
  className?: string;
  /**
   * 説明文の冒頭抜粋を出すかどうか。
   * 会期の議案一覧ページでのみ true にする。トップのセクション内など
   * 他の並びでは出さず、コンパクトな見た目を保つ。
   */
  showExcerpt?: boolean;
}

/**
 * コンパクトな水平レイアウトの法案カード
 * 過去国会セクションや過去国会議案一覧ページで使用
 */
export function CompactBillCard({
  bill,
  className,
  showExcerpt = false,
}: CompactBillCardProps) {
  const heading = getBillHeading(bill);
  const subTitle = getBillSubTitle(bill);
  const summary = bill.bill_content?.summary;
  const statusLabel = bill.status === "enacted" ? "成立" : "提出";

  return (
    <Card
      className={`border border-black shadow-none hover:bg-muted/50 transition-colors overflow-hidden ${className ?? ""}`}
    >
      <div className="flex">
        {/* コンテンツエリア */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <h3 className="font-bold text-[15px] leading-[1.6] line-clamp-2">
            {heading}
            {getArticleReviewState(bill) === "reviewed" && (
              <>
                {" "}
                <ReviewCompleteBadge size={14} top="1px" />
              </>
            )}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <BillStatusBadge status={bill.status} className="w-fit" />
              <BillProposalTypeBadge proposalType={bill.proposal_type} />
            </div>
            {bill.submitted_date && (
              <span className="text-xs text-muted-foreground">
                {formatDateWithDots(bill.submitted_date)} {statusLabel}
              </span>
            )}
          </div>
          {/* 見出しはやさしい一文、添えに正式な件名を出す。
              難易度要約は見出しと違うときだけ出す（ふつうでは見出しと
              同じ文になるため、難しいの「審議結果：…」のときだけ残る）。 */}
          {subTitle && (
            <RubySafeLineClamp
              text={subTitle}
              lineClamp={2}
              className="text-xs leading-relaxed text-mirai-text-secondary"
            />
          )}
          {summary && summary !== heading && (
            <RubySafeLineClamp
              text={summary}
              lineClamp={2}
              className="text-xs leading-relaxed text-mirai-text-secondary"
            />
          )}
          {/* 説明文の冒頭抜粋（会期の議案一覧ページのみ） */}
          {showExcerpt && bill.plain_excerpt && (
            <RubySafeLineClamp
              text={bill.plain_excerpt}
              lineClamp={2}
              className="text-xs leading-relaxed"
            />
          )}
        </div>

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div className="relative w-24 h-16 flex-shrink-0 self-center mr-4 rounded-lg overflow-hidden">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
