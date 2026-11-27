/**
 * 賛否が分かれた採決かどうかを本文テキストから判定する
 *
 * 「賛成26・反対1」のように賛成・反対の人数が併記されている場合のみ true。
 * 「賛成多数」や「全会一致」のような人数のない表現は false とする。
 * 半角・全角どちらの数字でも判定できる。
 */
const SPLIT_VOTE_PATTERN = /賛成\s*[0-9０-９]+\s*・\s*反対\s*[0-9０-９]+/;

export function hasSplitVote(text: string | null | undefined): boolean {
  if (!text) {
    return false;
  }

  return SPLIT_VOTE_PATTERN.test(text);
}
