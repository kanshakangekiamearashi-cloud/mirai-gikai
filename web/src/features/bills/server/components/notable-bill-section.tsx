import { BillCardList } from "../../client/components/bill-list/bill-card-list";
import type { BillWithContent } from "../../shared/types";

interface NotableBillSectionProps {
  bills: BillWithContent[];
}

/**
 * 注目の議案セクション。
 *
 * 賛否が分かれた議案と委員会で質疑があった議案を出す。対象の選定は
 * getNotableBills が担い、ここでは渡された議案をそのまま並べる。
 */
export function NotableBillSection({ bills }: NotableBillSectionProps) {
  if (bills.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      {/* セクションヘッダー */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-bold text-mirai-text leading-[1.48]">
          注目の議案🔥
        </h2>
        <p className="text-xs font-medium text-mirai-text-secondary leading-[1.67]">
          賛否が分かれた議案・委員会で質疑があった議案
        </p>
      </div>

      {/* 注目の議案カード（先頭はフルカード、以降はコンパクトカード） */}
      <BillCardList bills={bills} />
    </section>
  );
}
