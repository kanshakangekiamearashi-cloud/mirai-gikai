import type { DietSession } from "@/features/diet-sessions/shared/types";
import type { CouncilMember, CouncilMemberRole } from "../../shared/types";
import { groupMembersByFaction } from "../../shared/utils/group-members-by-faction";

type Props = {
  session: DietSession;
  members: CouncilMember[];
};

const ROLE_LABELS: Partial<Record<CouncilMemberRole, string>> = {
  chair: "議長",
  vice_chair: "副議長",
};

export function CouncilMemberList({ session, members }: Props) {
  const groups = groupMembersByFaction(members);
  const startYear = Number(session.start_date.split("-")[0]);

  return (
    <div className="flex flex-col gap-8">
      {/* セクションヘッダー */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-bold text-black leading-[1.48]">
          {startYear}年 {session.name}の議員名簿
        </h1>
        <p className="text-xs font-medium text-mirai-text">
          全{members.length}名（会派別）。副議長は出典で未確認のため、
          記載していません。
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          この会期の議員名簿はまだありません
        </p>
      ) : (
        groups.map((group) => (
          <section
            key={group.faction}
            className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-5"
          >
            <h2 className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-black">
                {group.faction}
              </span>
              <span className="text-sm font-bold text-primary-accent">
                {group.members.length}名
              </span>
            </h2>
            <ul className="flex flex-col gap-2">
              {group.members.map((member) => (
                <li key={member.id} className="flex items-baseline gap-3">
                  <span className="text-[15px] font-bold text-black">
                    {member.name}
                  </span>
                  <span className="text-xs text-mirai-text">
                    {member.reading}
                  </span>
                  {ROLE_LABELS[member.role] && (
                    <span className="text-xs font-bold text-primary-accent">
                      {ROLE_LABELS[member.role]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
