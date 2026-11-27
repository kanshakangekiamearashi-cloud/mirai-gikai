// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMockBill,
  createMockBillContent,
} from "@/app/dev/_lib/mock-data";
import { BillSearchCard } from "./bill-search-card";

describe("BillSearchCard", () => {
  it("カード全体が議案の詳細へのリンクになる", () => {
    render(<BillSearchCard bill={createMockBill({ id: "bill-gasoline" })} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/bills/bill-gasoline"
    );
  });

  // 一覧では何の法案かが読めないと選べないので、見出しは省略しない。
  it("長い見出しも省略せずに出す", () => {
    const heading =
      "地方公共団体の議会の議員及び長の選挙に係る公職選挙法の特例に関する法律の一部を改正する法律案";
    render(
      <BillSearchCard
        bill={createMockBill({
          plain_summary: heading,
          bill_content: createMockBillContent({
            title: "公職選挙法の特例に関する法律案",
            summary: heading,
          }),
        })}
      />
    );

    expect(screen.getByRole("heading")).toHaveTextContent(heading);
    expect(
      screen.getByText("公職選挙法の特例に関する法律案")
    ).toBeInTheDocument();
  });

  it("やさしい一文を見出しにし、正式な件名を添えに出す", () => {
    render(
      <BillSearchCard
        bill={createMockBill({
          plain_summary: "給食を無償にします。",
          bill_content: createMockBillContent({
            title: "給食を無償にする法案",
            summary: "給食を無償にします。",
          }),
        })}
      />
    );

    expect(
      screen.getByRole("heading", { name: /給食を無償にします/ })
    ).toBeInTheDocument();
    expect(screen.getByText("給食を無償にする法案")).toBeInTheDocument();
    expect(screen.getAllByText("給食を無償にします。")).toHaveLength(1);
  });

  it("難しい難易度でも見出しはやさしい一文のまま、審議結果の行も出す", () => {
    render(
      <BillSearchCard
        bill={createMockBill({
          plain_summary: "給食を無償にします。",
          bill_content: createMockBillContent({
            title: "給食を無償にする法案",
            summary: "審議結果：可決しました。",
            difficulty_level: "hard",
          }),
        })}
      />
    );

    expect(
      screen.getByRole("heading", { name: /給食を無償にします/ })
    ).toBeInTheDocument();
    expect(screen.getByText("給食を無償にする法案")).toBeInTheDocument();
    expect(screen.getByText("審議結果：可決しました。")).toBeInTheDocument();
  });

  it("やさしい一文が無ければふつうの要約を見出しにする", () => {
    render(
      <BillSearchCard
        bill={createMockBill({
          bill_content: createMockBillContent({
            title: "給食を無償にする法案",
            summary: "給食を無償にします。",
            difficulty_level: "normal",
          }),
        })}
      />
    );

    expect(
      screen.getByRole("heading", { name: /給食を無償にします/ })
    ).toBeInTheDocument();
    expect(screen.getByText("給食を無償にする法案")).toBeInTheDocument();
  });

  it("タイトルが無ければ正式名称を見出しにする", () => {
    render(
      <BillSearchCard
        bill={createMockBill({
          name: "学校給食法の一部を改正する法律案",
          bill_content: undefined,
          is_review_completed: false,
        })}
      />
    );

    expect(
      screen.getByRole("heading", { name: "学校給食法の一部を改正する法律案" })
    ).toBeInTheDocument();
  });

  it("概要が見出しと違えば添え、無ければ何も出さない", () => {
    const { rerender } = render(
      <BillSearchCard
        bill={createMockBill({
          plain_summary: "ガソリン税を安くします。",
          bill_content: createMockBillContent({
            summary: "税金を下げます。",
            difficulty_level: "hard",
          }),
        })}
      />
    );
    expect(screen.getByText("税金を下げます。")).toBeInTheDocument();

    rerender(
      <BillSearchCard bill={createMockBill({ bill_content: undefined })} />
    );
    expect(screen.queryByText("税金を下げます。")).not.toBeInTheDocument();
  });

  /*
    サムネイルはリンクの中の飾りなので alt を空にしている。読み上げは見出しの
    タイトルが担う。同じ内容を二度読ませない。
  */
  it("サムネイルは読み上げ対象にしない", () => {
    const { container } = render(
      <BillSearchCard
        bill={createMockBill({
          thumbnail_url: "https://example.com/thumb.png",
        })}
      />
    );

    const thumbnail = container.querySelector('img[alt=""]');
    expect(thumbnail).toBeInTheDocument();
  });

  // staging で多くの議案がサムネイル未設定だった。無い側も崩れずに出る必要がある。
  it("サムネイルが未設定なら画像を出さない", () => {
    const { container } = render(
      <BillSearchCard bill={createMockBill({ thumbnail_url: null })} />
    );

    expect(container.querySelector('img[alt=""]')).not.toBeInTheDocument();
  });

  it("提出日があるときだけ日付を出す", () => {
    const { rerender } = render(
      <BillSearchCard bill={createMockBill({ submitted_date: "2026-02-03" })} />
    );
    expect(screen.getByText("2026.2.3 提出")).toBeInTheDocument();

    rerender(
      <BillSearchCard bill={createMockBill({ submitted_date: null })} />
    );
    expect(
      screen.queryByText(/^\d{4}\.\d+\.\d+ 提出$/)
    ).not.toBeInTheDocument();
  });

  it("タグ・受付中・回答数が無ければ下の段ごと出さない", () => {
    render(
      <BillSearchCard
        bill={createMockBill({
          tags: [],
          hasPublicInterview: false,
          publicReportCount: 0,
        })}
      />
    );

    expect(screen.queryByText("AIインタビュー受付中")).not.toBeInTheDocument();
    expect(screen.queryByText(/回答/)).not.toBeInTheDocument();
  });

  it("タグと受付中を下の段に並べる", () => {
    render(
      <BillSearchCard
        bill={createMockBill({
          tags: [{ id: "zeikin", label: "税金" }],
          hasPublicInterview: true,
        })}
      />
    );

    expect(screen.getByText("税金")).toBeInTheDocument();
    expect(screen.getByText("AIインタビュー受付中")).toBeInTheDocument();
  });

  // 0人と書くと参加をためらわせるので、集まっている議案にだけ数字を出す。
  it("回答が集まっている議案にだけ回答数を出す", () => {
    const { rerender } = render(
      <BillSearchCard bill={createMockBill({ publicReportCount: 0 })} />
    );
    expect(
      screen.queryByText(/人がAIインタビューに回答/)
    ).not.toBeInTheDocument();

    rerender(
      <BillSearchCard bill={createMockBill({ publicReportCount: 12 })} />
    );
    expect(screen.getByText(/12人がAIインタビューに回答/)).toBeInTheDocument();
  });

  it("レビュー完了のときだけ完了バッジを添える", () => {
    const { rerender } = render(
      <BillSearchCard bill={createMockBill({ is_review_completed: false })} />
    );
    expect(
      screen.queryByRole("img", { name: "レビュー完了" })
    ).not.toBeInTheDocument();

    rerender(
      <BillSearchCard bill={createMockBill({ is_review_completed: true })} />
    );
    expect(
      screen.getByRole("img", { name: "レビュー完了" })
    ).toBeInTheDocument();
  });
});
