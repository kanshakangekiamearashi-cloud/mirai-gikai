import { describe, expect, it } from "vitest";
import { extractBillLead, extractBillLeadDetails } from "./bill-lead";

describe("extractBillLead", () => {
  it("コンテンツが無ければ null", () => {
    expect(extractBillLead(null)).toBeNull();
    expect(extractBillLead(undefined)).toBeNull();
    expect(extractBillLead("")).toBeNull();
  });

  it("「どんな議案ですか」節が無ければ null", () => {
    expect(
      extractBillLead("## 案件\n\n議案第1号「テストについて」")
    ).toBeNull();
  });

  it("言い換えだけでは短い場合、後続の文を足して約150〜220字の段落にする", () => {
    const content = `## どんな議案ですか

これは、第3次東広島市都市計画マスタープランを改定することを決める議案です。都市計画マスタープランとは、まちづくりの基本的な計画のことです。

改定の主な内容は、令和12年の目標人口を20万2,000人から20万5,000人へ引き上げること、半導体関連企業が集まる吉川地区を「特定機能拠点」に加えること、広島大学周辺地区と吉川地区を「次世代学園都市ゾーン」と位置付けることです。第五次東広島市総合計画の後期基本計画に合わせて見直します。

## なぜ必要か

第五次東広島市総合計画の後期基本計画が作られたことを踏まえ、改定するものです。`;
    const lead = extractBillLead(content);

    expect(
      lead?.startsWith("これは、第3次東広島市都市計画マスタープラン")
    ).toBe(true);
    expect(lead).toContain("20万5,000人へ引き上げること");
    expect(lead?.endsWith("ことです。")).toBe(true);
    expect(lead?.length).toBeGreaterThanOrEqual(150);
    expect(lead?.length).toBeLessThanOrEqual(220);
    // 後続の節（なぜ必要か）は含めない
    expect(lead).not.toContain("後期基本計画が作られたことを踏まえ");
  });

  it("予算の議案では、言い換え・用語説明に続けて金額の文まで取り込む", () => {
    const opening =
      "これは、令和8年度東広島市一般会計補正予算（第3号）を決める議案です。一般会計とは、市の基本的な仕事のお金を扱う会計のことです。補正予算とは、年度の途中で予算を直すことです。";
    const amount =
      "一般会計に3億9,971万5千円を追加し、総額を1,098億4,642万1千円にします。";
    const largest =
      "歳出では、民生費への3億3,124万2千円の追加が最も大きく、社会福祉や子育て、生活保護などに充てます。";
    const content = `## どんな議案ですか

${opening}

${amount}${largest}このほかに、教育費への追加も含まれます。

## なぜ必要か

年度の途中で必要になった支出に対応するための補正です。`;

    expect(extractBillLead(content)).toBe(`${opening}${amount}${largest}`);
  });

  it("報告では、言い換えに続けて報告の中身まで取り込む", () => {
    const opening =
      "これは、専決処分について議会へ報告するものです。専決処分とは、市長が議会の議決を待たずに先に決めたことです。この報告は議決の対象ではありません。";
    const body =
      "内容は、交通事故の損害賠償です。令和8年3月27日、市道丸山川角線で公用車が軽自動車に接触し、その右側面などを壊しました。賠償額は14万9,600円で、令和8年7月13日に専決処分されました。";
    const content = `## どんな議案ですか

${opening}

${body}

## なぜ必要か

地方自治法の規定により、議会への報告が行われるものです。`;

    expect(extractBillLead(content)).toBe(`${opening}${body}`);
  });

  it("節全体が短い場合は、ある分だけをそのまま返す", () => {
    const content = `## どんな議案ですか

この議案は議長が発議しました。`;
    expect(extractBillLead(content)).toBe("この議案は議長が発議しました。");
  });

  it("上限を超える文は足さず、文の終わりで止める", () => {
    const sentence = `${"あ".repeat(99)}。`;
    const content = `## どんな議案ですか

${sentence}${sentence}${sentence}`;
    expect(extractBillLead(content)).toBe(`${sentence}${sentence}`);
  });

  it("次の文を足すと上限を超える場合は、足さずに止める", () => {
    const first = `${"あ".repeat(139)}。`;
    const second = `${"い".repeat(99)}。`;
    const content = `## どんな議案ですか

${first}${second}`;
    expect(extractBillLead(content)).toBe(first);
  });

  it("冒頭の文だけで上限を超える場合は読点で切って「…」を付ける", () => {
    const first = `${"あ".repeat(100)}、${"い".repeat(150)}。`;
    const content = `## どんな議案ですか

${first}`;
    const lead = extractBillLead(content);

    expect(lead).toBe(`${"あ".repeat(100)}…`);
  });

  it("残った本文が見出しと同じ・見出しから始まるなら null", () => {
    const content = `## どんな議案ですか

公園を整備する議案です。`;
    expect(
      extractBillLead(content, { heading: "公園を整備する議案" })
    ).toBeNull();
  });

  it("Markdown記法とルビは落とす", () => {
    const content = `## どんな議案ですか

これは、**テスト**を決める議案です。<ruby>漢字<rt>かんじ</rt></ruby>とは、文字のことです。${"あ".repeat(120)}。`;
    const lead = extractBillLead(content);

    expect(lead).toContain(
      "テストを決める議案です。漢字とは、文字のことです。"
    );
    expect(lead).not.toContain("かんじ");
    expect(lead).not.toContain("**");
  });
});

describe("extractBillLeadDetails", () => {
  it("リードを構成する文の列を返す（連結するとリードと一致する）", () => {
    const content = `## どんな議案ですか

これは、第3次東広島市都市計画マスタープランを改定することを決める議案です。都市計画マスタープランとは、まちづくりの基本的な計画のことです。

改定の主な内容は、令和12年の目標人口を20万2,000人から20万5,000人へ引き上げること、半導体関連企業が集まる吉川地区を「特定機能拠点」に加えること、広島大学周辺地区と吉川地区を「次世代学園都市ゾーン」と位置付けることです。第五次東広島市総合計画の後期基本計画に合わせて見直します。
`;
    const details = extractBillLeadDetails(content);

    expect(details?.sentences).toHaveLength(3);
    expect(details?.sentences.join("")).toBe(details?.lead);
    expect(details?.sentences[0]).toBe(
      "これは、第3次東広島市都市計画マスタープランを改定することを決める議案です。"
    );
  });

  it("冒頭の文を切り捨てた場合は、文の列は空になる", () => {
    const first = `${"あ".repeat(100)}、${"い".repeat(150)}。`;
    const content = `## どんな議案ですか

${first}`;
    const details = extractBillLeadDetails(content);

    expect(details?.lead.endsWith("…")).toBe(true);
    expect(details?.sentences).toEqual([]);
  });

  it("リードが作れない場合は null", () => {
    expect(extractBillLeadDetails(null)).toBeNull();
    expect(extractBillLeadDetails("## 案件\n\n議案第1号")).toBeNull();
  });
});
