import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import type { SluggedDietSession } from "@/features/diet-sessions/shared/types";
import { routes } from "@/lib/routes";
import { formatDateWithDots } from "@/lib/utils/date";
import type { CouncilSessionSummary } from "../loaders/get-council-session-summary";

type CouncilSessionEntrySectionProps = {
  session: SluggedDietSession;
  summary: CouncilSessionSummary;
};

/**
 * トップページの会期入口セクション。
 *
 * トップには会期ページへの導線が無く、収録した議案・一般質問・議員名簿へ
 * たどり着けなかったため、現在の会期（閉会中は直近の会期）への入口を
 * 件数つきで置く。収録が無い項目のカードは出さず、全て0件なら
 * セクション自体を描画しない。
 */
export function CouncilSessionEntrySection({
  session,
  summary,
}: CouncilSessionEntrySectionProps) {
  const { billCount, questionCount, speakerCount, memberCount } = summary;

  if (billCount === 0 && questionCount === 0 && memberCount === 0) {
    return null;
  }

  return (
    <Container className="pt-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-mirai-border-light bg-white px-5 py-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-bold text-primary-accent">
            東広島市議会の記録
          </p>
          <h2 className="text-xl font-bold">{session.name}</h2>
          <p className="text-[13px] font-bold text-mirai-text-secondary">
            {formatDateWithDots(session.start_date)} -{" "}
            {formatDateWithDots(session.end_date)}
            <span className="ml-3 font-medium">
              この会期の議案・一般質問・議員名簿を掲載しています
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {billCount > 0 && (
            <EntryCard
              href={routes.kokkaiSessionBills(session.slug) as Route}
              label={`議案一覧（${billCount}件）`}
            />
          )}
          {questionCount > 0 && (
            <EntryCard
              href={routes.kokkaiSessionQuestions(session.slug) as Route}
              label={`一般質問（${questionCount}項目・${speakerCount}名）`}
            />
          )}
          {memberCount > 0 && (
            <EntryCard
              href={routes.kokkaiSessionMembers(session.slug) as Route}
              label={`議員名簿（${memberCount}名）`}
            />
          )}
        </div>
      </div>
    </Container>
  );
}

type EntryCardProps = {
  href: Route;
  label: string;
};

/** 会期入口セクションと過去の定例会セクションで共用する導線カード。 */
export function EntryCard({ href, label }: EntryCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-1 items-center justify-between rounded-xl bg-mirai-surface-muted px-4 py-4"
    >
      <span className="text-[15px] font-bold text-black">{label}</span>
      <ChevronRight className="h-5 w-5 text-black" />
    </Link>
  );
}
