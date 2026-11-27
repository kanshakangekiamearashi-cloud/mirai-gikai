import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BillCardList } from "../../client/components/bill-list/bill-card-list";
import type { BillsByTag } from "../../shared/types";
import {
  billsListHref,
  DEFAULT_BILLS_LIST_PARAMS,
} from "../../shared/utils/parse-bills-list-params";

interface BillsByTagSectionProps {
  billsByTag: BillsByTag[];
}

/** タグ別セクションで最初に見せる件数。これより多い場合は一覧へ誘導する。 */
const MAX_BILLS_PER_TAG = 3;

export function BillsByTagSection({ billsByTag }: BillsByTagSectionProps) {
  if (billsByTag.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12">
      {billsByTag.map(({ tag, bills }) => {
        const hasMore = bills.length > MAX_BILLS_PER_TAG;
        const visibleBills = bills.slice(0, MAX_BILLS_PER_TAG);

        return (
          <section key={tag.id} className="flex flex-col gap-6">
            {/* タグヘッダー */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[22px] font-bold text-black leading-[1.48]">
                  {tag.label}
                </h2>
                {tag.description && (
                  <p className="text-xs text-mirai-text-secondary">
                    {tag.description}
                  </p>
                )}
              </div>
              {hasMore && (
                <Link
                  href={billsListHref(DEFAULT_BILLS_LIST_PARAMS, {
                    tagId: tag.id,
                  })}
                  className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-primary-accent"
                >
                  もっと見る
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>

            <BillCardList bills={visibleBills} />
          </section>
        );
      })}
    </div>
  );
}
