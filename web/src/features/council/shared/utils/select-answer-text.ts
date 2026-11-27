import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { GeneralQuestion } from "../types";
import {
  formatAnswerDetailLabel,
  formatAnswerSourceLabel,
} from "./format-answer-source-label";

export type SelectedAnswerText = {
  /** 表示する答弁テキスト */
  text: string;
  /** 出典つきの見出しラベル */
  label: string;
  /** 詳細版（難易度「hard」用の answer_detail）を表示しているか */
  isDetail: boolean;
};

/**
 * 難易度に応じて、一般質問の項目に表示する答弁テキストを選ぶ。
 *
 * - 要旨が公表されていない項目は null（呼び出し側で「未公表」を表示する）。
 * - 難易度「hard」かつ詳細版（answer_detail）がある項目は詳細版を返す。
 *   詳細版の無い項目は、難易度によらず要旨を返す（無いものを補わない）。
 * - それ以外は要旨（answer_summary）を返す。
 */
export function selectAnswerText(
  question: GeneralQuestion,
  difficultyLevel: DifficultyLevelEnum
): SelectedAnswerText | null {
  if (
    question.answer_status !== "summary_published" ||
    !question.answer_summary
  ) {
    return null;
  }

  if (difficultyLevel === "hard" && question.answer_detail) {
    return {
      text: question.answer_detail,
      label: formatAnswerDetailLabel(question.answer_detail_source),
      isDetail: true,
    };
  }

  return {
    text: question.answer_summary,
    label: formatAnswerSourceLabel(question.answer_source),
    isDetail: false,
  };
}
