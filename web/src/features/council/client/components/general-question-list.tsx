import type { DietSession } from "@/features/diet-sessions/shared/types";
import type { GeneralQuestion } from "../../shared/types";
import { groupQuestionsBySpeaker } from "../../shared/utils/group-questions-by-speaker";

type Props = {
  session: DietSession;
  questions: GeneralQuestion[];
};

/** YYYY-MM-DD を「M月D日」に整形する（タイムゾーンの影響を受けない） */
function formatAskedOn(askedOn: string): string {
  const [, month, day] = askedOn.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

export function GeneralQuestionList({ session, questions }: Props) {
  const groups = groupQuestionsBySpeaker(questions);
  const startYear = Number(session.start_date.split("-")[0]);

  return (
    <div className="flex flex-col gap-8">
      {/* セクションヘッダー */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-bold text-black leading-[1.48]">
          {startYear}年 {session.name}の一般質問
        </h1>
        <p className="text-xs font-medium text-mirai-text">
          {groups.length}名・{questions.length}
          項目（登壇順）。答弁要旨は議会だよりvol.213の要旨であり、
          本会議会議録の逐語ではありません。会議録が未公開のため、
          抜粋掲載のない項目は「未確認」と明記しています。
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          この会期の一般質問はまだありません
        </p>
      ) : (
        groups.map((group) => (
          <section
            key={`${group.speakerName}-${group.askedOn}`}
            className="flex flex-col gap-4 rounded-2xl bg-white px-5 py-5"
          >
            <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-lg font-bold text-black">
                {group.speakerName}
              </span>
              <span className="text-sm font-bold text-primary-accent">
                {group.speakerFaction}
              </span>
              <span className="text-sm text-mirai-text">
                {formatAskedOn(group.askedOn)}
              </span>
            </h2>
            <div className="flex flex-col gap-5">
              {group.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <h3 className="text-[15px] font-bold text-black leading-[1.6]">
                    {item.topic}
                  </h3>
                  {item.answer_status === "summary_published" &&
                  item.answer_summary ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-bold text-primary-accent">
                        答弁要旨（{item.answer_source ?? "議会だよりvol.213"}）
                      </p>
                      <p className="text-sm text-mirai-text leading-[1.8] whitespace-pre-wrap">
                        {item.answer_summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-mirai-text-muted">
                      答弁要旨は未公表（未確認）
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
