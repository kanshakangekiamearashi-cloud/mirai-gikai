import type { GeneralQuestion } from "../types";

export type SpeakerQuestionGroup = {
  speakerName: string;
  speakerFaction: string;
  askedOn: string;
  items: GeneralQuestion[];
};

/**
 * 一般質問を登壇順（seq昇順）のまま質問者ごとにまとめる純粋関数。
 *
 * 同じ質問者が連続して登壇する前提で、speaker_name が変わるたびに
 * 新しいグループを作る。入力の並び順は変更しない。
 */
export function groupQuestionsBySpeaker(
  questions: GeneralQuestion[]
): SpeakerQuestionGroup[] {
  const groups: SpeakerQuestionGroup[] = [];
  for (const question of questions) {
    const last = groups[groups.length - 1];
    if (last && last.speakerName === question.speaker_name) {
      last.items.push(question);
    } else {
      groups.push({
        speakerName: question.speaker_name,
        speakerFaction: question.speaker_faction,
        askedOn: question.asked_on,
        items: [question],
      });
    }
  }
  return groups;
}
