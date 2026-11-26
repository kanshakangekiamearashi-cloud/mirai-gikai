import type { Route } from "next";
import { Container } from "@/components/layouts/container";
import { routes } from "@/lib/routes";
import { formatDateWithDots } from "@/lib/utils/date";
import type { PastCouncilSessionEntry } from "../loaders/get-past-council-session-entries";
import { EntryCard } from "./council-session-entry-section";

type PastCouncilSessionsSectionProps = {
  entries: PastCouncilSessionEntry[];
};

/**
 * トップページの「過去の定例会」セクション。
 *
 * 入口セクションは現在の会期（閉会中は直近の会期）しか出しておらず、
 * 過去の定例会の議案・一般質問へトップからたどり着けなかったため、
 * 会期ごとの入口を件数つきで並べる。見た目は入口セクションに揃える。
 * 収録が無い項目のカードは出さない。
 */
export function PastCouncilSessionsSection({
  entries,
}: PastCouncilSessionsSectionProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Container className="pt-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-mirai-border-light bg-white px-5 py-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-bold text-primary-accent">過去の定例会</p>
          <p className="text-[13px] font-medium text-mirai-text-secondary">
            過去の定例会の議案・一般質問も掲載しています
          </p>
        </div>

        {entries.map(({ session, summary }) => (
          <div key={session.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-bold">{session.name}</h3>
              <p className="text-[13px] font-bold text-mirai-text-secondary">
                {formatDateWithDots(session.start_date)} -{" "}
                {formatDateWithDots(session.end_date)}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {summary.billCount > 0 && (
                <EntryCard
                  href={routes.kokkaiSessionBills(session.slug) as Route}
                  label={`議案一覧（${summary.billCount}件）`}
                />
              )}
              {summary.questionCount > 0 && (
                <EntryCard
                  href={routes.kokkaiSessionQuestions(session.slug) as Route}
                  label={`一般質問（${summary.questionCount}項目・${summary.speakerCount}名）`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
