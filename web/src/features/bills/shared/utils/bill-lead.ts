/**
 * 議案詳細ページの見出し直下に出すリード文（概要文）を作る。
 *
 * 本家（チームみらい）の詳細ページが、見出しとバッジの下・正式名称の上に
 * 数行の概要文を出す形に合わせるためのもの。カード用の抜粋
 * （bill-excerpt）が「言い換えを除いた中身」を出すのに対し、リード文は
 * 「ふつう」（normal）本文の「## どんな議案ですか」節の冒頭そのものを
 * 使う。冒頭が言い換え文だけでは短いので、後続の文（目的・金額などの
 * 中身）を文単位で足し、約150〜220字の段落にする。
 *
 * 節の冒頭がそのまま見出しと重なる場合は null を返し、ページ側では
 * 何も出さない（見出しの二重表示を避ける）。
 */
import {
  extractSection,
  normalizeForCompare,
  splitSentences,
  toPlainParagraphs,
} from "./bill-excerpt";

const DEFAULT_MIN_LENGTH = 150;
const DEFAULT_MAX_LENGTH = 220;
/** 読点で切る場合に必要とする最低の長さ。短すぎる断片は出さない。 */
const MIN_PHRASE_LENGTH = 10;

export function extractBillLead(
  content: string | null | undefined,
  options: {
    heading?: string | null;
    minLength?: number;
    maxLength?: number;
  } = {}
): string | null {
  if (!content) {
    return null;
  }
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  const section = extractSection(content);
  if (!section) {
    return null;
  }

  const paragraphs = toPlainParagraphs(section);
  if (paragraphs.length === 0) {
    return null;
  }

  const sentences = paragraphs.flatMap((paragraph) =>
    splitSentences(paragraph)
  );
  if (sentences.length === 0) {
    return null;
  }

  // 文単位で、最低量に達するまで足す。上限を超える文は足さない
  // （文の途中で切らない）。冒頭の文だけで上限を超える場合のみ、
  // 読点の区切りで切って「…」を付ける。
  let lead = "";
  for (const sentence of sentences) {
    if (lead.length + sentence.length > maxLength) {
      if (!lead) {
        lead = `${cutAtPhraseBoundary(sentence, maxLength)}…`;
      }
      break;
    }
    lead += sentence;
    if (lead.length >= minLength) {
      break;
    }
  }
  if (!lead) {
    return null;
  }

  // 見出しそのもの・見出しから始まる文は重複になるので出さない。
  const heading = options.heading?.trim();
  if (heading) {
    const normalizedLead = normalizeForCompare(lead);
    const normalizedHeading = normalizeForCompare(heading);
    if (
      normalizedLead === normalizedHeading ||
      normalizedLead.startsWith(normalizedHeading)
    ) {
      return null;
    }
  }

  return lead;
}

/** 文を上限字数以内の最後の読点で切る。読点が無ければ上限で切る。 */
function cutAtPhraseBoundary(sentence: string, limit: number): string {
  const head = sentence.slice(0, limit);
  const commaIndex = Math.max(head.lastIndexOf("、"), head.lastIndexOf("，"));
  if (commaIndex >= MIN_PHRASE_LENGTH) {
    return head.slice(0, commaIndex);
  }
  return head.replace(/[、，]$/, "");
}
