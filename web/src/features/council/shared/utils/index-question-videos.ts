import type { CouncilQuestionVideo } from "../types";

/**
 * 動画リンクを「質問者名|登壇日」のキーで引ける Map に変換する純粋関数。
 * 一般質問リストの質問者グループ（speakerName + askedOn）と対応付けるために使う。
 * 同一キーが重複した場合は先勝ち（ユニーク制約で通常は発生しない）。
 */
export function indexQuestionVideosBySpeakerDate(
  videos: CouncilQuestionVideo[]
): Map<string, CouncilQuestionVideo> {
  const map = new Map<string, CouncilQuestionVideo>();
  for (const video of videos) {
    const key = `${video.speaker_name}|${video.asked_on}`;
    if (!map.has(key)) {
      map.set(key, video);
    }
  }
  return map;
}
