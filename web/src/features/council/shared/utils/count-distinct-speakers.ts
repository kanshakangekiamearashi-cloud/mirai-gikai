import type { GeneralQuestion } from "../types";

/**
 * 一般質問の質問者数を数える（同一人物の複数項目は1名として数える）
 */
export function countDistinctSpeakers(questions: GeneralQuestion[]): number {
  return new Set(questions.map((question) => question.speaker_name)).size;
}
