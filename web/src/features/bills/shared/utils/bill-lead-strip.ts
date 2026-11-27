/**
 * 詳細ページで、リード文と本文の二重表示を取り除く。
 *
 * リード文（bill-lead）は「ふつう」本文の「## どんな議案ですか」節の
 * 冒頭から作るため、そのままでは同じ文がリードと節の両方に出てしまう。
 * ここでは表示用の本文から、リードを構成した文と一致する節冒頭の文を
 * 取り除き、節がリードの続きから始まるようにする。保存されている
 * 本文データ自体は書き換えず、表示（ローダー）の段階でのみ適用する。
 *
 * 取り除くのは、節の冒頭からリードの文と（空白と末尾の句点を除いて）
 * 完全に一致する文だけ。「むずかしい」本文は公式文そのもので言い回しが
 * 異なり、冒頭がリードの文と一致しないため、実際には変更されない。
 * 対応付けを確実に行えない場合（Markdown記法の変換が検証できない
 * 場合を含む）は、本文をそのまま返す。
 *
 * 節の文がすべてリードに含まれる場合は、見出しごと節を取り除く
 * （空の見出しを残さない）。
 */
import {
  findSectionRange,
  normalizeForCompare,
  splitSentences,
  toPlainParagraphs,
} from "./bill-excerpt";

export function stripBillLeadDuplication(
  content: string,
  leadSentences: readonly string[]
): string {
  if (!content || leadSentences.length === 0) {
    return content;
  }

  const range = findSectionRange(content);
  if (!range) {
    return content;
  }

  const sectionSentences = toPlainParagraphs(range.body).flatMap((paragraph) =>
    splitSentences(paragraph)
  );
  if (sectionSentences.length === 0) {
    return content;
  }

  // 節の冒頭から、リードの文と一致する文の数を数える。
  let matched = 0;
  const limit = Math.min(leadSentences.length, sectionSentences.length);
  while (
    matched < limit &&
    normalizeForCompare(sectionSentences[matched]) ===
      normalizeForCompare(leadSentences[matched])
  ) {
    matched += 1;
  }
  if (matched === 0) {
    return content;
  }

  const strippedBody = removeLeadingSentences(range.body, matched);
  if (strippedBody === null) {
    // 対応付けに失敗したら安全側に倒し、本文を変えない。
    return content;
  }

  const lines = content.split("\n");
  const before = lines.slice(0, range.headingIndex);
  const after = lines.slice(range.endIndex);

  if (strippedBody === "") {
    // 節が空になる場合は見出しごと取り除く。
    return [...before, ...after].join("\n").replace(/\n{3,}/g, "\n\n");
  }
  return [...before, lines[range.headingIndex], "", strippedBody, "", ...after]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * 節の本文から冒頭の count 文を取り除いた本文を返す。
 *
 * 段落単位で落とせる分は段落ごと落とし、段落の途中までかかる場合は
 * 文の終わりの位置で切る。記法を落とした文との対応付けが検証できない
 * 場合は null を返し、呼び出し側は本文を変更しない。
 * すべて取り除かれる場合は空文字列を返す。
 */
function removeLeadingSentences(body: string, count: number): string | null {
  const plainParagraphs = toPlainParagraphs(body);
  const rawParagraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  if (rawParagraphs.length !== plainParagraphs.length) {
    return null;
  }

  const kept: string[] = [];
  let remaining = count;
  for (const [index, rawParagraph] of rawParagraphs.entries()) {
    const plain = toPlainParagraphs(rawParagraph);
    if (plain.length !== 1 || plain[0] !== plainParagraphs[index]) {
      return null;
    }
    const sentences = splitSentences(plain[0]);

    if (remaining >= sentences.length) {
      remaining -= sentences.length;
      continue;
    }
    if (remaining > 0) {
      const cut = findRawSentenceEnd(rawParagraph, sentences, remaining);
      if (cut === null) {
        return null;
      }
      const rest = rawParagraph.slice(cut).trim();
      if (rest && toPlainParagraphs(rest).length > 0) {
        kept.push(rest);
      }
      remaining = 0;
      continue;
    }
    kept.push(rawParagraph);
  }
  if (remaining > 0) {
    return null;
  }
  return kept.join("\n\n");
}

/**
 * 段落の raw テキストの中で、冒頭 sentenceCount 文が終わる位置
 * （raw のインデックス）を返す。記法を落としたプレーンテキストと
 * raw の対応付けが検証できない場合は null。
 */
function findRawSentenceEnd(
  rawParagraph: string,
  expectedSentences: string[],
  sentenceCount: number
): number | null {
  const mapped = mapPlainChars(rawParagraph);
  if (!mapped) {
    return null;
  }
  const sentences = splitSentences(mapped.plain);
  if (
    sentences.length !== expectedSentences.length ||
    sentences.some((sentence, i) => sentence !== expectedSentences[i])
  ) {
    return null;
  }

  // 文の終わり（。！？の位置）をプレーンテキスト上で数える。
  // splitSentences と同じ規則で、末尾に句読点の無い残りも1文と数える。
  let seen = 0;
  for (let i = 0; i < mapped.plain.length; i++) {
    const ch = mapped.plain[i];
    if (ch === "。" || ch === "！" || ch === "？") {
      seen += 1;
      if (seen === sentenceCount) {
        return mapped.rawEnds[i];
      }
    }
  }
  // 句読点で終わらない最後の文まで取り除く場合。
  if (seen + 1 === sentenceCount && mapped.plain.trim().length > 0) {
    return mapped.rawEnds[mapped.rawEnds.length - 1];
  }
  return null;
}

/**
 * 段落の raw テキストを、toPlainParagraphs と同じ規則で記法を落とした
 * プレーンテキストに対応付ける。各プレーン文字について、その文字の
 * 直後にあたる raw インデックスを返す。想定外の記法があれば null。
 */
function mapPlainChars(
  rawParagraph: string
): { plain: string; rawEnds: number[] } | null {
  const chars: string[] = [];
  const rawEnds: number[] = [];
  let lineStart = 0;

  for (const line of rawParagraph.split("\n")) {
    // 行頭の見出し記号・箇条書き記号は toPlainParagraphs と同じ順で落とす。
    let offset = lineStart;
    const headingMarker = /^#{1,6}\s*/.exec(line);
    if (headingMarker) {
      offset += headingMarker[0].length;
    }
    const listMarker = /^\s*[-*+]\s+/.exec(line.slice(offset - lineStart));
    if (listMarker) {
      offset += listMarker[0].length;
    }

    let i = offset - lineStart;
    while (i < line.length) {
      const rest = line.slice(i);
      const dropped =
        /^<rt>.*?<\/rt>/.exec(rest) ??
        /^!\[[^\]]*\]\([^)]*\)/.exec(rest) ??
        /^<[^>]+>/.exec(rest) ??
        /^\]\([^)]*\)/.exec(rest) ??
        /^\*\*|^__/.exec(rest) ??
        /^[[*`]/.exec(rest);
      if (dropped) {
        i += dropped[0].length;
        continue;
      }
      chars.push(line[i]);
      rawEnds.push(lineStart + i + 1);
      i += 1;
    }
    lineStart += line.length + 1;
  }

  const plain = chars.join("");
  const expected = toPlainParagraphs(rawParagraph);
  if (expected.length !== 1 || expected[0] !== plain) {
    return null;
  }
  return { plain, rawEnds };
}
