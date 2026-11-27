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

/**
 * 難易度「hard」で表示する詳細な答弁テキストの見出しラベルを整形する。
 * 要旨と同じく、出典は項目ごとの answer_detail_source をそのまま使い、
 * 出典が無い場合は補わない。
 */
export function formatAnswerDetailLabel(
  answerDetailSource: string | null
): string {
  return answerDetailSource
    ? `答弁の詳しい記録（${answerDetailSource}）`
    : "答弁の詳しい記録";
}
