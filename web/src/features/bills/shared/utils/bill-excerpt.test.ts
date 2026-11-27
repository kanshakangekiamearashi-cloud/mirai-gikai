import { describe, expect, it } from "vitest";
import { extractBillExcerpt } from "./bill-excerpt";

describe("extractBillExcerpt", () => {
  it("コンテンツが無ければ null", () => {
    expect(extractBillExcerpt(null)).toBeNull();
    expect(extractBillExcerpt(undefined)).toBeNull();
    expect(extractBillExcerpt("")).toBeNull();
  });

  it("「どんな議案ですか」節が無ければ null", () => {
    expect(
      extractBillExcerpt("## 案件\n\n議案第1号「テストについて」")
    ).toBeNull();
  });

  it("言い換えと用語説明しか無い1段落なら null（見出しの二重表示を避ける）", () => {
    const content = `## どんな議案ですか

これは、議員を派遣することを決める議案です。議員派遣とは、議員を会議などへ送ることです。

## 審議結果

原案可決`;
    expect(extractBillExcerpt(content)).toBeNull();
  });

  it("2段落なら言い換えの段落を落とし、中身の段落から抜粋する", () => {
    const content = `## どんな議案ですか

これは、請負契約を締結することを決める議案です。請負契約とは、工事などを外部の事業者に頼む契約のことです。締結とは、契約を結ぶことです。

工事は、下黒瀬小学校の校舎を長く使えるように改修し、エレベーター棟などを増築する工事です。契約金額は16億473万5,000円で、相手方は平原・楠本・シンク特定建設工事共同企業体、工期は議決のあった日の翌日から令和9年12月13日までです。

## 審議結果

原案可決`;
    const excerpt = extractBillExcerpt(content);

    expect(excerpt).not.toBeNull();
    expect(excerpt?.startsWith("工事は、下黒瀬小学校")).toBe(true);
    expect(excerpt).toContain("16億473万5,000円");
    expect(excerpt).not.toContain("これは");
    // 後続の節（審議結果）は含めない
    expect(excerpt).not.toContain("原案可決");
    expect(excerpt?.endsWith("…")).toBe(true);
    expect(excerpt?.length).toBeLessThanOrEqual(91);
  });

  it("報告（言い換えが「ものです。」終わり）でも中身から抜粋する", () => {
    const content = `## どんな議案ですか

これは、専決処分について議会へ報告するものです。専決処分とは、市長が議会の議決を待たずに先に決めたことです。この報告は議決の対象ではありません。

内容は、交通事故の損害賠償です。令和8年3月27日、市道丸山川角線で公用車が軽自動車に接触し、その右側面などを壊しました。賠償額は14万9,600円で、令和8年7月13日に専決処分されました。

## 審議結果

報告（議決対象外）`;
    const excerpt = extractBillExcerpt(content);

    expect(excerpt?.startsWith("内容は、交通事故の損害賠償です。")).toBe(true);
    expect(excerpt).toContain("賠償額は14万9,600円");
    expect(excerpt).not.toContain("専決処分とは");
  });

  it("最初の文だけで上限を超える場合は句読点で切る", () => {
    const content = `## どんな議案ですか

これは、第3次東広島市都市計画マスタープランを改定することを決める議案です。都市計画マスタープランとは、まちづくりの基本的な計画のことです。

改定の主な内容は、令和12年の目標人口を20万2,000人から20万5,000人へ引き上げること、半導体関連企業が集まる吉川地区を「特定機能拠点」に加えること、広島大学周辺地区と吉川地区を「次世代学園都市ゾーン」と位置付けることです。第五次東広島市総合計画の後期基本計画に合わせて見直します。

## 審議結果

原案可決（賛成多数）`;
    const excerpt = extractBillExcerpt(content);

    expect(excerpt?.startsWith("改定の主な内容は、")).toBe(true);
    expect(excerpt).toContain("20万5,000人へ引き上げること");
    expect(excerpt?.endsWith("…")).toBe(true);
    expect(excerpt?.length).toBeLessThanOrEqual(91);
  });

  it("1段落でも言い換えと用語説明を落として中身を残す", () => {
    const content = `## どんな議案ですか

これは、公園の整備に関する条例を改正することを決める議案です。条例とは、市のルールのことです。改正の内容は、公園の使用料を無料にすることです。`;
    expect(extractBillExcerpt(content)).toBe(
      "改正の内容は、公園の使用料を無料にすることです。"
    );
  });

  it("文単位で収まる分は文の終わりで切り、残り幅が小さいときは文の途中を足さない", () => {
    const first = `${"あ".repeat(79)}。`;
    const second = `${"い".repeat(50)}。`;
    const content = `## どんな議案ですか

これは、テストのための議案です。

${first}${second}`;
    expect(extractBillExcerpt(content)).toBe(`${"あ".repeat(79)}…`);
  });

  it("Markdown記法（強調・リンク）は落とす", () => {
    const content = `## どんな議案ですか

これは、予算を決める議案です。

総額は**16億円**で、詳しくは[市の資料](https://example.com)を見てください。`;
    const excerpt = extractBillExcerpt(content);

    expect(excerpt).toBe("総額は16億円で、詳しくは市の資料を見てください。");
  });

  it("残った本文が見出しと同じなら null", () => {
    const content = `## どんな議案ですか

これは、公園を整備することを決める議案です。公園を整備する議案`;
    expect(
      extractBillExcerpt(content, { heading: "公園を整備する議案" })
    ).toBeNull();
  });

  it("上限以内なら切り取らずそのまま返す", () => {
    const content = `## どんな議案ですか

これは、図書館の指定管理者を決める議案です。

指定管理者は図書館の運営を担う事業者で、期間は5年間です。`;
    expect(extractBillExcerpt(content)).toBe(
      "指定管理者は図書館の運営を担う事業者で、期間は5年間です。"
    );
  });
});
