/**
 * 答弁要旨の見出しラベルを整形する。
 *
 * 出典は項目ごとにDBの answer_source に保持されている（例: 第3回定例会の
 * 掲載項目は「議会だよりvol.213」）。出典が無い項目では、特定の会期だけに
 * 当てはまる出典名を補って表示してはならないため、出典名なしのラベルにする。
 */
export function formatAnswerSourceLabel(answerSource: string | null): string {
  return answerSource ? `答弁要旨（${answerSource}）` : "答弁要旨";
}
