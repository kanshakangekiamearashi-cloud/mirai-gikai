import type { CouncilMember, GeneralQuestion } from "../types";
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
 * 両方とも空の場合は空文字列を返す（プロンプト側でセクションごと省略する）。
 */
export function buildCouncilDigest(
  questions: GeneralQuestion[],
  members: CouncilMember[]
): string {
  const sections: string[] = [];

  if (questions.length > 0) {
    sections.push(buildQuestionsSection(questions));
  }
  if (members.length > 0) {
    sections.push(buildMembersSection(members));
  }

  return sections.join("\n\n");
}

function buildQuestionsSection(questions: GeneralQuestion[]): string {
  const speakerCount = countDistinctSpeakers(questions);
  const lines: string[] = [
    `### 一般質問（質問者${speakerCount}名・全${questions.length}項目、登壇順）`,
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

function buildMembersSection(members: CouncilMember[]): string {
  const lines: string[] = [`### 議員名簿（全${members.length}名）`];

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
