/**
 * カードに出す説明文の冒頭抜粋を作る。
 *
 * 「ふつう」（normal）本文の「## どんな議案ですか」節から、見出しの言い換えに
 * なっている冒頭文を除いた残りを約90字で切り取る。本家（チームみらい）の
 * カードが「見出し＋説明文の冒頭」を出す形に合わせるためのもの。
 *
 * 節の作りは2通りある:
 * - 2段落: 1段落目が見出しの言い換え＋用語説明、2段落目が中身（目的・背景・金額）
 * - 1段落: 言い換え文・用語説明・中身が1段落に続く
 *
 * 言い換えしか残らない場合は null を返し、カード側では何も出さない
 * （見出しの二重表示を避ける）。
 */

const SECTION_TITLE = "どんな議案ですか";
const DEFAULT_MAX_LENGTH = 90;
/** 文の途中で足す場合に必要とする最低の残り幅。これ未満なら文単位で切る。 */
const MIN_PARTIAL_LENGTH = 20;
/** 句読点で切る場合に必要とする最低の長さ。短すぎる断片は出さない。 */
const MIN_PHRASE_LENGTH = 10;

export function extractBillExcerpt(
  content: string | null | undefined,
  options: { heading?: string | null; maxLength?: number } = {}
): string | null {
  if (!content) {
    return null;
  }
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  const section = extractSection(content);
  if (!section) {
    return null;
  }

  const paragraphs = toPlainParagraphs(section);
  if (paragraphs.length === 0) {
    return null;
  }

  const body = dropOpeningRestatement(paragraphs);
  if (!body) {
    return null;
  }

  // 見出しそのもの・見出しから始まる文は重複になるので出さない。
  const heading = options.heading?.trim();
  if (heading) {
    const normalizedBody = normalizeForCompare(body);
    const normalizedHeading = normalizeForCompare(heading);
    if (
      normalizedBody === normalizedHeading ||
      normalizedBody.startsWith(normalizedHeading)
    ) {
      return null;
    }
  }

  return truncateExcerpt(body, maxLength);
}

/** 「## どんな議案ですか」節の本文（次の ## 見出しまで）を取り出す。 */
export function extractSection(content: string): string | null {
  const range = findSectionRange(content);
  return range ? range.body : null;
}

/**
 * 「## どんな議案ですか」節の範囲を返す。
 *
 * headingIndex は見出し行の位置、endIndex は次の ## 見出し行の位置
 * （無ければ行数＝末尾）。body はその間の本文（見出し行を含まない）。
 */
export function findSectionRange(content: string): {
  headingIndex: number;
  endIndex: number;
  body: string;
} | null {
  const lines = content.split("\n");
  const start = lines.findIndex((line) =>
    new RegExp(`^##\\s*${SECTION_TITLE}\\s*$`).test(line)
  );
  if (start === -1) {
    return null;
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return {
    headingIndex: start,
    endIndex: end,
    body: lines.slice(start + 1, end).join("\n"),
  };
}

/** Markdown記法を落とし、段落（空行区切り）のプレーンテキストにする。 */
export function toPlainParagraphs(section: string): string[] {
  const plain = section
    // ルビの読み仮名は落とし、親文字だけ残す
    .replace(/<rt>.*?<\/rt>/g, "")
    .replace(/<[^>]+>/g, "")
    // 画像は落とし、リンクはテキストだけ残す
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // 強調・コード
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1");

  return plain
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) =>
          line.replace(/^#{1,6}\s*/, "").replace(/^\s*[-*+]\s+/, "")
        )
        .join("")
        .trim()
    )
    .filter((paragraph) => paragraph.length > 0);
}

/** 文（。！？終端）ごとに分割する。区切り文字は各文の末尾に残す。 */
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  const pattern = /[^。！？]*[。！？]/g;
  let consumed = 0;
  for (const match of text.matchAll(pattern)) {
    sentences.push(match[0]);
    consumed = match.index + match[0].length;
  }
  const rest = text.slice(consumed).trim();
  if (rest) {
    sentences.push(rest);
  }
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}

/** 見出しの言い換え文かどうか（「これは、…する議案です。」等）。 */
function isRestatement(sentence: string): boolean {
  return (
    sentence.startsWith("これは") ||
    /議案です。$/.test(sentence) ||
    /ものです。$/.test(sentence)
  );
}

/** 用語説明の文かどうか（「〇〇とは、…ことです。」）。 */
function isGlossary(sentence: string): boolean {
  return /とは[、，]/.test(sentence) && /ことです。$/.test(sentence);
}

/**
 * 冒頭の言い換えを取り除いた本文を返す。
 *
 * 2段落以上で1段落目が言い換えから始まる場合は、1段落目ごと落とす
 * （言い換えに続く用語説明も一緒に落ち、中身の段落だけが残る）。
 * それ以外は文単位で、言い換え文と用語説明が続く間だけ落とす。
 */
function dropOpeningRestatement(paragraphs: string[]): string {
  const firstSentences = splitSentences(paragraphs[0]);
  if (
    paragraphs.length >= 2 &&
    firstSentences.length > 0 &&
    isRestatement(firstSentences[0])
  ) {
    return paragraphs.slice(1).join("");
  }

  const sentences = paragraphs.flatMap((paragraph) =>
    splitSentences(paragraph)
  );
  let index = 0;
  while (
    index < sentences.length &&
    (isRestatement(sentences[index]) || isGlossary(sentences[index]))
  ) {
    index += 1;
  }
  return sentences.slice(index).join("");
}

/**
 * 約maxLength字に切り取る。
 *
 * 文単位で収まる分を優先し、残り幅があれば次の文を句読点の区切りで足す。
 * 切り取った場合は末尾の句読点を落として「…」を付ける。
 */
function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const sentences = splitSentences(text);
  let result = "";
  for (const sentence of sentences) {
    if (result.length + sentence.length > maxLength) {
      const remaining = maxLength - result.length;
      if (result.length > 0 && remaining >= MIN_PARTIAL_LENGTH) {
        const partial = cutAtPhraseBoundary(sentence, remaining);
        if (partial) {
          result += partial;
        }
      }
      break;
    }
    result += sentence;
  }

  if (!result && sentences.length > 0) {
    result =
      cutAtPhraseBoundary(sentences[0], maxLength) ?? text.slice(0, maxLength);
  }

  return `${result.replace(/[。．、，]$/, "")}…`;
}

/** 文を上限字数以内の最後の読点で切る。読点が無ければ上限で切る。 */
function cutAtPhraseBoundary(sentence: string, limit: number): string | null {
  if (limit <= 0) {
    return null;
  }
  const head = sentence.slice(0, limit);
  const commaIndex = Math.max(head.lastIndexOf("、"), head.lastIndexOf("，"));
  if (commaIndex >= MIN_PHRASE_LENGTH) {
    return head.slice(0, commaIndex);
  }
  return head.length >= MIN_PHRASE_LENGTH ? head : null;
}

/** 見出しとの重複判定用に、空白と末尾の句点を落として比べる。 */
export function normalizeForCompare(text: string): string {
  return text.replace(/\s/g, "").replace(/。$/, "");
}
