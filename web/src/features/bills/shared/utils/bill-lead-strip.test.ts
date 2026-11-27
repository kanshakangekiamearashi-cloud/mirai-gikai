import { describe, expect, it } from "vitest";
import { extractSection } from "./bill-excerpt";
import { extractBillLeadDetails } from "./bill-lead";
import { stripBillLeadDuplication } from "./bill-lead-strip";

// 議案第139号（令和8年第3回定例会）の実際の本文に即した fixture。
const NORMAL_139 = `## どんな議案ですか

これは、第3次東広島市都市計画マスタープランを改定することを決める議案です。都市計画マスタープランとは、まちづくりの基本的な計画のことです。

改定の主な内容は、令和12年の目標人口を20万2,000人から20万5,000人へ引き上げること、半導体関連企業が集まる吉川地区を「特定機能拠点」に加えること、広島大学周辺地区と吉川地区を「次世代学園都市ゾーン」と位置付けることです。第五次東広島市総合計画の後期基本計画に合わせて見直します。

## 付託委員会

建設委員会

## なぜ必要か

第五次東広島市総合計画の後期基本計画が作られたことを踏まえ、改定するものです。
`;

// 「むずかしい」本文は公式文の言い回しで、リードの文とは一致しない。
const HARD_139 = `## 案件

議案第139号「第3次東広島市都市計画マスタープランの改定について」

## どんな議案ですか

第五次東広島市総合計画後期基本計画を踏まえ、次世代学園都市の実現に向けた取組等を反映するため、第3次東広島市都市計画マスタープランを改定するもの。改定の概要は、(1)目標人口について、令和12年の目標人口の設定を20万2,000人から20万5,000人へ見直すこと、(2)都市づくりの基本方針に、次世代学園都市の実現に向けた方針を追加すること。根拠は東広島市議会基本条例第14条。

## なぜ必要か

第五次東広島市総合計画後期基本計画を踏まえ、改定しようとするもの。
`;

function leadSentencesOf(content: string): string[] {
  const details = extractBillLeadDetails(content);
  if (!details) {
    throw new Error("lead が作れませんでした");
  }
  return details.sentences;
}

describe("stripBillLeadDuplication", () => {
  it("「ふつう」本文では、リードと重なる冒頭の文だけを取り除き、節は続きから始まる", () => {
    const sentences = leadSentencesOf(NORMAL_139);
    const stripped = stripBillLeadDuplication(NORMAL_139, sentences);

    const section = extractSection(stripped);
    expect(section).toContain(
      "第五次東広島市総合計画の後期基本計画に合わせて見直します。"
    );
    // リードに含まれる文は節に残らない
    for (const sentence of sentences) {
      expect(section).not.toContain(sentence);
    }
    // 後続の節はそのまま残る
    expect(stripped).toContain("## 付託委員会\n\n建設委員会");
    expect(stripped).toContain("## なぜ必要か");
  });

  it("節の文がすべてリードに含まれる場合は、見出しごと節を取り除く", () => {
    const content = `## どんな議案ですか

これは、令和8年度東広島市一般会計補正予算（第3号）を決める議案です。一般会計とは、市の基本的な仕事のお金を扱う会計のことです。補正予算とは、年度の途中で予算を直すことです。

一般会計に3億9,971万5千円を追加し、総額を1,098億4,642万1千円にします。歳出では、民生費への3億3,124万2千円の追加が最も大きく、社会福祉や子育て、生活保護などに充てます。

## なぜ必要か

年度の途中で必要になった支出に対応するための補正です。
`;
    const sentences = leadSentencesOf(content);
    const stripped = stripBillLeadDuplication(content, sentences);

    expect(stripped).not.toContain("## どんな議案ですか");
    expect(stripped).not.toContain("一般会計に3億9,971万5千円を追加し");
    expect(stripped).toContain(
      "## なぜ必要か\n\n年度の途中で必要になった支出に対応するための補正です。"
    );
    // 空行が重ならない
    expect(stripped).not.toContain("\n\n\n");
  });

  it("節が1文だけの議長発議では、節ごと取り除かれ、出典の節が残る", () => {
    const content = `## どんな議案ですか

これは、議員派遣について決める議案です。議員派遣とは、議員を派遣することです。この議案は議長が発議しました。

## 出典・関連リンク

- [令和8年第3回定例会（東広島市議会公式サイト）](https://example.com/)
`;
    const sentences = leadSentencesOf(content);
    const stripped = stripBillLeadDuplication(content, sentences);

    expect(stripped).not.toContain("## どんな議案ですか");
    expect(stripped).toContain("## 出典・関連リンク");
    expect(stripped).toContain("令和8年第3回定例会（東広島市議会公式サイト）");
  });

  it("末尾の節がすべてリードに含まれる場合も、見出しごと取り除く", () => {
    const content = `## 出典・関連リンク

- [公式サイト](https://example.com/)

## どんな議案ですか

この議案は議長が発議しました。
`;
    const stripped = stripBillLeadDuplication(content, [
      "この議案は議長が発議しました。",
    ]);

    expect(stripped).not.toContain("## どんな議案ですか");
    expect(stripped).toContain("## 出典・関連リンク");
    expect(stripped).not.toContain("\n\n\n");
  });

  it("リードの文が無ければ本文を変えない", () => {
    expect(stripBillLeadDuplication(NORMAL_139, [])).toBe(NORMAL_139);
  });

  it("節が無い本文は変えない", () => {
    const content = `## 案件

議案第62号「請負契約の締結について」
`;
    expect(
      stripBillLeadDuplication(content, ["これは、請負契約の議案です。"])
    ).toBe(content);
  });

  it("「むずかしい」本文は、冒頭がリードの文と一致しないため変えない", () => {
    const sentences = leadSentencesOf(NORMAL_139);
    expect(stripBillLeadDuplication(HARD_139, sentences)).toBe(HARD_139);
  });

  it("冒頭の文がリードと一致する本文では、その文だけを取り除く", () => {
    const content = `## どんな議案ですか

これは、公園を整備することを決める議案です。費用は市が負担します。

## なぜ必要か

老朽化のためです。
`;
    const stripped = stripBillLeadDuplication(content, [
      "これは、公園を整備することを決める議案です。",
    ]);

    const section = extractSection(stripped);
    expect(section).toContain("費用は市が負担します。");
    expect(section).not.toContain(
      "これは、公園を整備することを決める議案です。"
    );
  });

  it("段落の途中で切る場合も、残りの記法（ルビ・強調・リンク）はそのまま残る", () => {
    const content = `## どんな議案ですか

これは、<ruby>公園<rt>こうえん</rt></ruby>を整備することを決める議案です。公園とは、みんなが遊べる場所のことです。整備には**3億円**がかかります。詳しくは[市の資料](https://example.com/doc)を見てください。

## なぜ必要か

老朽化のためです。
`;
    const details = extractBillLeadDetails(content, {
      minLength: 40,
      maxLength: 100,
    });
    if (!details) {
      throw new Error("lead が作れませんでした");
    }
    expect(details.sentences).toHaveLength(2);

    const stripped = stripBillLeadDuplication(content, details.sentences);
    const section = extractSection(stripped);
    expect(section).toContain(
      "整備には**3億円**がかかります。詳しくは[市の資料](https://example.com/doc)を見てください。"
    );
    expect(section).not.toContain("こうえん");
    expect(section).not.toContain("みんなが遊べる場所のことです。");
  });

  it("取り除いた本文にもう一度適用しても変わらない", () => {
    const sentences = leadSentencesOf(NORMAL_139);
    const once = stripBillLeadDuplication(NORMAL_139, sentences);
    expect(stripBillLeadDuplication(once, sentences)).toBe(once);
  });
});
