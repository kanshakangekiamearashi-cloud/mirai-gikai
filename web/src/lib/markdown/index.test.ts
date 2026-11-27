import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./index";

type El = {
  type?: unknown;
  props?: { children?: unknown };
};

function flattenElements(node: unknown, out: El[] = []): El[] {
  if (Array.isArray(node)) {
    for (const n of node) flattenElements(n, out);
    return out;
  }
  if (node && typeof node === "object" && "type" in node) {
    const el = node as El;
    out.push(el);
    flattenElements(el.props?.children, out);
  }
  return out;
}

function textOf(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object") {
    return textOf((node as El).props?.children);
  }
  return "";
}

describe("parseMarkdown", () => {
  it("should not allow malicious iframe elements", async () => {
    const markdown = `<iframe src="https://malicious.com/evil" onload="alert('XSS')"></iframe>

https://www.youtube.com/watch?v=safe123`;

    const result = await parseMarkdown(markdown);
    const html = renderToStaticMarkup(result);

    // 悪意のあるiframeは削除され、YouTube埋め込みだけが残ることを確認
    expect(html).not.toContain("malicious.com");
    expect(html).not.toContain("onload");
    expect(html).toContain('src="https://www.youtube.com/embed/safe123"');
  });

  /*
    セクション分けは見出しの文言に依存しないことの回帰テスト。
    東広島市版の normal コンテンツは先頭見出しが「案件」ではなく
    「どんな議案ですか」だが、議案詳細ページはこのパイプラインの
    汎用な h2 セクション化だけで描画される（2026-11-27 の表示調査で確認）。
    注入要素（DifficultyInfoCard 等）は非同期コンポーネントなので、
    文字列化ではなく要素ツリーで検証する。
  */
  it("should section content under arbitrary h2 headings", async () => {
    const markdown = `## どんな議案ですか

これは、条例を新しく制定することを決める議案です。

## 審議結果

原案可決（賛成多数）

## 付託委員会

市民経済委員会`;

    const result = await parseMarkdown(markdown);
    const elements = flattenElements(result);

    const h2Texts = elements
      .filter((el) => el.type === "h2")
      .map((el) => textOf(el));
    expect(h2Texts).toEqual(["どんな議案ですか", "審議結果", "付託委員会"]);

    const sectionTexts = elements
      .filter((el) => el.type === "section")
      .map((el) => textOf(el));
    expect(
      sectionTexts.some((t) => t.includes("条例を新しく制定すること"))
    ).toBe(true);
    expect(sectionTexts.some((t) => t.includes("原案可決（賛成多数）"))).toBe(
      true
    );
    expect(sectionTexts.some((t) => t.includes("市民経済委員会"))).toBe(true);
  });
});
