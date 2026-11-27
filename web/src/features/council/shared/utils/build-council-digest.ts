import type {
  CouncilCommitteeDigestEntry,
  CouncilMember,
  CouncilSessionDigestData,
  GeneralQuestion,
} from "../types";
import { countDistinctSpeakers } from "./count-distinct-speakers";
import { groupMembersByFaction } from "./group-members-by-faction";
import { groupQuestionsBySpeaker } from "./group-questions-by-speaker";

/**
 * 一般質問と議員名簿を、トップページ用チャットのプロンプトに渡すための
 * コンパクトなテキストダイジェストに変換する純粋関数。
 *
 * 入力は登壇順・掲載順にソート済みである前提で、並び順は変更しない。
 * 一般質問は質問者ごとに項目を並べ、公表済みの答弁要旨は全文を含める。
 * 未公表の項目にはその旨のマーカーを付ける。
 * 議員名簿は議長・副議長を先頭に示し、残りは会派ごとに1行で列挙する。
 * 委員会は議員名簿の後に、委員会ごとに1行で委員長・副委員長・委員を列挙する。
 * すべて空の場合は空文字列を返す（プロンプト側でセクションごと省略する）。
 * 委員会引数は省略可能で、空の場合は委員会セクションごと省略する。
 */
export function buildCouncilDigest(
  questions: GeneralQuestion[],
  members: CouncilMember[],
  committees: CouncilCommitteeDigestEntry[] = []
): string {
  const sections: string[] = [];

  if (questions.length > 0) {
    sections.push(buildQuestionsSection(questions));
  }
  if (members.length > 0) {
    sections.push(buildMembersSection(members));
  }
  if (committees.length > 0) {
    sections.push(buildCommitteesSection(committees));
  }

  return sections.join("\n\n");
}

/**
 * 複数会期分の一般質問・議案見出しと、議員名簿・委員会を、チャット用
 * ダイジェストに変換する純粋関数。
 *
 * 会期は渡された順（新しい順を想定）に「### 会期名」の見出しで区切り、
 * 各会期の中に一般質問と議案（見出しレベル）を持つ。一般質問も議案も
 * 無い会期は丸ごと省略する。議員名簿と委員会は1会期分しか収録がない
 * ため、対象会期名（membersSessionName）を併記して会期を取り違えない
 * ようにする。すべて空の場合は空文字列を返す。
 */
export function buildMultiSessionCouncilDigest(
  sessions: CouncilSessionDigestData[],
  members: CouncilMember[],
  committees: CouncilCommitteeDigestEntry[] = [],
  membersSessionName?: string
): string {
  const sections: string[] = [];

  const nonEmptySessions = sessions.filter(
    (session) => session.questions.length > 0 || session.bills.length > 0
  );
  if (nonEmptySessions.length > 0) {
    const sessionNames = nonEmptySessions
      .map((session) => session.sessionName)
      .join("、");
    sections.push(`収録会期：${sessionNames}（新しい順）`);
    for (const session of nonEmptySessions) {
      sections.push(buildSessionSection(session));
    }
  }
  if (members.length > 0) {
    sections.push(buildMembersSection(members, "###", membersSessionName));
  }
  if (committees.length > 0) {
    sections.push(
      buildCommitteesSection(committees, "###", membersSessionName)
    );
  }

  return sections.join("\n\n");
}

function buildSessionSection(session: CouncilSessionDigestData): string {
  const subSections: string[] = [`### ${session.sessionName}`];

  if (session.questions.length > 0) {
    subSections.push(buildQuestionsSection(session.questions, "####"));
  }
  if (session.bills.length > 0) {
    subSections.push(buildBillsSection(session.bills));
  }

  return subSections.join("\n\n");
}

function buildBillsSection(bills: CouncilSessionDigestData["bills"]): string {
  const lines: string[] = [`#### 議案（全${bills.length}件）`];

  for (const bill of bills) {
    const fragments = [bill.name];
    if (bill.plainHeading) {
      fragments.push(bill.plainHeading);
    }
    if (bill.statusLabel) {
      fragments.push(bill.statusLabel);
    }
    lines.push(`- ${fragments.join("｜")}`);
  }

  return lines.join("\n");
}

function buildCommitteesSection(
  committees: CouncilCommitteeDigestEntry[],
  headingPrefix = "###",
  sessionName?: string
): string {
  const title = sessionName
    ? `委員会（${sessionName}・全${committees.length}委員会）`
    : `委員会（全${committees.length}委員会）`;
  const lines: string[] = [`${headingPrefix} ${title}`];

  const sorted = [...committees].sort((a, b) => a.seq - b.seq);
  for (const committee of sorted) {
    const fragments: string[] = [];
    if (committee.chairName) {
      fragments.push(`委員長 ${committee.chairName}`);
    }
    if (committee.viceChairName) {
      fragments.push(`副委員長 ${committee.viceChairName}`);
    }
    if (committee.memberNames.length > 0) {
      fragments.push(`委員 ${committee.memberNames.join("、")}`);
    }
    lines.push(
      fragments.length > 0
        ? `- ${committee.name}：${fragments.join("、")}`
        : `- ${committee.name}`
    );
  }

  return lines.join("\n");
}

function buildQuestionsSection(
  questions: GeneralQuestion[],
  headingPrefix = "###"
): string {
  const speakerCount = countDistinctSpeakers(questions);
  const lines: string[] = [
    `${headingPrefix} 一般質問（質問者${speakerCount}名・全${questions.length}項目、登壇順）`,
  ];

  const groups = groupQuestionsBySpeaker(questions);
  groups.forEach((group, index) => {
    lines.push(`${index + 1}. ${group.speakerName}（${group.speakerFaction}）`);
    for (const item of group.items) {
      if (item.answer_status === "summary_published" && item.answer_summary) {
        lines.push(`- ${item.topic}`);
        lines.push(`  答弁要旨：${item.answer_summary}`);
      } else {
        lines.push(`- ${item.topic}（答弁要旨は未公表）`);
      }
    }
  });

  return lines.join("\n");
}

function buildMembersSection(
  members: CouncilMember[],
  headingPrefix = "###",
  sessionName?: string
): string {
  const title = sessionName
    ? `議員名簿（${sessionName}・全${members.length}名）`
    : `議員名簿（全${members.length}名）`;
  const lines: string[] = [`${headingPrefix} ${title}`];

  const leaders: string[] = [];
  const chair = members.find((member) => member.role === "chair");
  const viceChair = members.find((member) => member.role === "vice_chair");
  if (chair) {
    leaders.push(`議長：${chair.name}`);
  }
  if (viceChair) {
    leaders.push(`副議長：${viceChair.name}`);
  }
  if (leaders.length > 0) {
    lines.push(leaders.join("／"));
  }

  for (const group of groupMembersByFaction(members)) {
    const names = group.members.map((member) => member.name).join("、");
    lines.push(`- ${group.faction}（${group.members.length}名）：${names}`);
  }

  return lines.join("\n");
}
