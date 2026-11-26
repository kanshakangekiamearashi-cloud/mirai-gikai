import type { BillCommitteeQa } from "../../shared/types";

type Props = {
  committeeQa: BillCommitteeQa[];
};

/**
 * 委員会での質疑応答の要点を表示するセクション。
 * 出典に掲載された質疑がある議案でのみ呼び出すこと。
 */
export function CommitteeQaSection({ committeeQa }: Props) {
  if (committeeQa.length === 0) return null;

  const sources = [...new Set(committeeQa.map((qa) => qa.source))];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[22px] font-bold text-black leading-[1.48]">
        委員会での質疑
      </h2>
      <div className="flex flex-col gap-5 rounded-2xl bg-white px-5 py-5">
        {committeeQa.map((qa) => (
          <div key={qa.id} className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-primary-accent">質疑</p>
              <p className="text-sm text-mirai-text leading-[1.8]">
                {qa.question_summary}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-primary-accent">答弁</p>
              <p className="text-sm text-mirai-text leading-[1.8]">
                {qa.answer_summary}
              </p>
            </div>
          </div>
        ))}
        <p className="text-xs font-medium text-mirai-text-muted">
          出典：{sources.join("、")}に掲載された質疑応答の要点です。
        </p>
      </div>
    </section>
  );
}
