// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMockBill,
  createMockBillContent,
} from "@/app/dev/_lib/mock-data";
import type { BillsByTag } from "../../shared/types";
import { BillsByTagSection } from "./bills-by-tag-section";

const billNamed = (id: string, title: string) =>
  createMockBill({
    id,
    bill_content: createMockBillContent({ title, summary: `${title}の要約` }),
  });

const group = (
  label: string,
  bills: ReturnType<typeof billNamed>[],
  description?: string
): BillsByTag => ({
  tag: { id: label, label, description, priority: 0 },
  bills,
});

describe("BillsByTagSection", () => {
  it("タグごとに見出しと議案を出す", () => {
    render(
      <BillsByTagSection
        billsByTag={[
          group("暮らし", [billNamed("a", "暮らしの法案")]),
          group("税金", [billNamed("b", "税金の法案")]),
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "暮らし" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "税金" })).toBeInTheDocument();
    expect(screen.getByText("暮らしの法案")).toBeInTheDocument();
    expect(screen.getByText("税金の法案")).toBeInTheDocument();
  });

  it("説明があれば出し、無ければ出さない", () => {
    const { rerender } = render(
      <BillsByTagSection
        billsByTag={[group("暮らし", [billNamed("a", "法案")], "暮らしの説明")]}
      />
    );
    expect(screen.getByText("暮らしの説明")).toBeInTheDocument();

    rerender(
      <BillsByTagSection
        billsByTag={[group("暮らし", [billNamed("a", "法案")])]}
      />
    );
    expect(screen.queryByText("暮らしの説明")).not.toBeInTheDocument();
  });

  it("グループが無ければ何も出さない", () => {
    const { container } = render(<BillsByTagSection billsByTag={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("議案詳細へのリンクにする", () => {
    render(
      <BillsByTagSection
        billsByTag={[group("暮らし", [billNamed("bill-1", "法案")])]}
      />
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/bills/bill-1");
  });

  /*
    先頭だけフルカード、2件目以降はコンパクトカードにする。
    以前はコンパクトカードに要約が無かったため要約の有無で見分けていたが、
    コンパクトカードも要約を出すようになったので、フルカードだけが出す
    タグの件数で見分ける（モックのタグは各議案に2つ付いている）。
  */
  it("2件目以降はコンパクトカードにする", () => {
    render(
      <BillsByTagSection
        billsByTag={[
          group("暮らし", [
            billNamed("a", "1件目の法案"),
            billNamed("b", "2件目の法案"),
          ]),
        ]}
      />
    );

    // 要約はどちらのカードにも出る
    expect(screen.getByText("1件目の法案の要約")).toBeInTheDocument();
    expect(screen.getByText("2件目の法案の要約")).toBeInTheDocument();
    // タグはフルカード（1件目）だけが出すので1件分だけ
    expect(screen.getAllByText("経済")).toHaveLength(1);
    expect(screen.getAllByText("環境")).toHaveLength(1);
  });
});
