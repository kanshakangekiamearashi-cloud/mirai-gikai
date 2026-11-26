import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { EXTERNAL_LINKS } from "@/config/external-links";
import type { ComingSoonBill } from "@/features/bills/shared/types";
import { Card, CardContent } from "../ui/card";

interface ComingSoonSectionProps {
  bills: ComingSoonBill[];
}

export function ComingSoonSection({ bills }: ComingSoonSectionProps) {
  // 掲載予定の議案が無いときは、空のセクション自体を出さない
  if (bills.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-bold text-black leading-[1.48]">
          これから掲載される議案
        </h2>
        <p className="text-xs text-mirai-text-secondary">
          みらい議会は、順次更新されていきます
        </p>
      </div>

      {/* Coming soonカードリスト */}
      <div className="flex flex-col gap-3">
        {bills.map((bill) => (
          <ComingSoonBillCard key={bill.id} bill={bill} />
        ))}
      </div>

      {/* 東広島市議会公式サイトへのリンク */}
      <div className="text-right text-sm text-mirai-text-secondary">
        <Link
          href={EXTERNAL_LINKS.HIGASHIHIROSHIMA_COUNCIL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 inline-flex items-center gap-1"
        >
          東広島市議会の公式情報は{" "}
          <span className="underline">東広島市議会公式サイトへ</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

function ComingSoonBillCard({ bill }: { bill: ComingSoonBill }) {
  // タイトルがあればそれを表示、なければ正式名称を表示
  const displayTitle = bill.title || bill.name;
  // 正式名称（タイトルがある場合のみ別途表示）
  const officialName = bill.title ? bill.name : null;

  const content = (
    <Card
      className={`border border-black ${
        bill.shugiin_url
          ? "hover:bg-gray-50 transition-colors cursor-pointer"
          : ""
      }`}
    >
      <CardContent className="flex items-center justify-between py-4 px-5">
        <div className="flex flex-col gap-1 min-w-0 pr-3">
          <h3 className="font-bold text-base text-black leading-tight">
            {displayTitle}
          </h3>
          {officialName && (
            <p className="text-xs text-mirai-text-subtle">{officialName}</p>
          )}
        </div>
        {bill.shugiin_url && (
          <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </CardContent>
    </Card>
  );

  // shugiin_url がある場合は外部リンク
  if (bill.shugiin_url) {
    return (
      <Link
        href={bill.shugiin_url as Route}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
