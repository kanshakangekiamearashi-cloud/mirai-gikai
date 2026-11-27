// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMockBill,
  createMockBillContent,
} from "@/app/dev/_lib/mock-data";
import { BillCard } from "./bill-card";

describe("BillCard", () => {
  it("やさしい一文を見出しにし、正式な件名を添えに出す", () => {
    render(
      <BillCard
        bill={createMockBill({
          plain_summary: "ガソリンにかかる税金を下げる法案です。",
          bill_content: createMockBillContent({
            title: "ガソリン税を安くする法案",
            summary: "ガソリンにかかる税金を下げる法案です。",
          }),
        })}
      />
    );

    expect(
      screen.getByText("ガソリンにかかる税金を下げる法案です。")
    ).toBeInTheDocument();
    expect(screen.getByText("ガソリン税を安くする法案")).toBeInTheDocument();
    // ふつうの要約は見出しと同じ文なので、要約として二重に出さない。
    expect(
      screen.getAllByText("ガソリンにかかる税金を下げる法案です。")
    ).toHaveLength(1);
  });

  it("難しい難易度でも見出しはやさしい一文のまま、審議結果の行も出す", () => {
    render(
      <BillCard
        bill={createMockBill({
          plain_summary: "ガソリンにかかる税金を下げる法案です。",
          bill_content: createMockBillContent({
            title: "ガソリン税を安くする法案",
            summary: "審議結果：可決しました。",
            difficulty_level: "hard",
          }),
        })}
      />
    );

    expect(
      screen.getByText("ガソリンにかかる税金を下げる法案です。")
    ).toBeInTheDocument();
    expect(screen.getByText("ガソリン税を安くする法案")).toBeInTheDocument();
    expect(screen.getByText("審議結果：可決しました。")).toBeInTheDocument();
  });

  it("やさしい一文が無ければふつうの要約を見出しにする", () => {
    render(
      <BillCard
        bill={createMockBill({
          bill_content: createMockBillContent({
            title: "ガソリン税を安くする法案",
            summary: "ガソリンにかかる税金を下げる法案です。",
            difficulty_level: "normal",
          }),
        })}
      />
    );

    expect(
      screen.getByText("ガソリンにかかる税金を下げる法案です。")
    ).toBeInTheDocument();
    expect(screen.getByText("ガソリン税を安くする法案")).toBeInTheDocument();
  });

  it("コンテンツが無ければ正式名称を見出しにする", () => {
    render(
      <BillCard
        bill={createMockBill({
          name: "学校給食法の一部を改正する法律案",
          bill_content: undefined,
          is_review_completed: false,
        })}
      />
    );

    expect(
      screen.getByText("学校給食法の一部を改正する法律案")
    ).toBeInTheDocument();
  });

  it("説明文の抜粋があれば見出しの下に出す", () => {
    render(
      <BillCard
        bill={createMockBill({
          plain_summary: "小学校を改修する工事の契約を結ぶ議案",
          plain_excerpt:
            "工事は、下黒瀬小学校の校舎を長く使えるように改修する工事です。契約金額は16億473万5,000円で…",
          bill_content: createMockBillContent({
            title: "請負契約の締結について",
            summary: "小学校を改修する工事の契約を結ぶ議案",
          }),
        })}
      />
    );

    expect(
      screen.getByText(/契約金額は16億473万5,000円で/)
    ).toBeInTheDocument();
  });

  it("説明文の抜粋が無ければ出さない", () => {
    render(
      <BillCard
        bill={createMockBill({
          plain_summary: "小学校を改修する工事の契約を結ぶ議案",
          plain_excerpt: null,
          bill_content: createMockBillContent({
            title: "請負契約の締結について",
            summary: "小学校を改修する工事の契約を結ぶ議案",
          }),
        })}
      />
    );

    expect(screen.queryByText(/契約金額は/)).not.toBeInTheDocument();
  });

  it("注目の議案にだけ注目バッジを出す", () => {
    const { rerender } = render(
      <BillCard bill={createMockBill({ is_featured: false })} />
    );
    expect(screen.queryByText(/注目/)).not.toBeInTheDocument();

    rerender(<BillCard bill={createMockBill({ is_featured: true })} />);
    expect(screen.getByText(/注目/)).toBeInTheDocument();
  });

  // staging で多くの議案がサムネイル未設定だった。無い側も崩れずに出る必要がある。
  it("サムネイルが未設定なら画像を出さない", () => {
    render(
      <BillCard
        bill={createMockBill({
          name: "揮発油税等の暫定税率の廃止等に関する法律案",
          thumbnail_url: null,
        })}
      />
    );

    // レビュー完了バッジも img なので、サムネイルの代替テキストで狙う。
    expect(
      screen.queryByRole("img", {
        name: "揮発油税等の暫定税率の廃止等に関する法律案",
      })
    ).not.toBeInTheDocument();
  });

  it("サムネイルがあれば正式名称を代替テキストにして出す", () => {
    render(
      <BillCard
        bill={createMockBill({
          name: "揮発油税等の暫定税率の廃止等に関する法律案",
          thumbnail_url: "https://example.com/thumb.png",
        })}
      />
    );

    expect(
      screen.getByRole("img", {
        name: "揮発油税等の暫定税率の廃止等に関する法律案",
      })
    ).toBeInTheDocument();
  });

  /*
    サムネイルの有無で注目バッジの配置が absolute と relative に切り替わる。
    切り替え先はクラス名にしか現れないので、ここでは両方が同時に出ることだけを
    見る。重なり方そのものは目で見て確かめる。
  */
  it("サムネイルがあっても注目バッジを出す", () => {
    render(
      <BillCard
        bill={createMockBill({
          name: "揮発油税等の暫定税率の廃止等に関する法律案",
          is_featured: true,
          thumbnail_url: "https://example.com/thumb.png",
        })}
      />
    );

    expect(screen.getByText(/注目/)).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "揮発油税等の暫定税率の廃止等に関する法律案",
      })
    ).toBeInTheDocument();
  });

  it("紐づくタグをすべて並べる", () => {
    render(
      <BillCard
        bill={createMockBill({
          tags: [
            { id: "zeikin", label: "税金" },
            { id: "kurashi", label: "暮らし" },
          ],
        })}
      />
    );

    expect(screen.getByText("税金")).toBeInTheDocument();
    expect(screen.getByText("暮らし")).toBeInTheDocument();
  });

  it("公開インタビューがあるときだけ受付中を出す", () => {
    const { rerender } = render(
      <BillCard bill={createMockBill({ hasPublicInterview: false })} />
    );
    expect(screen.queryByText("AIインタビュー受付中")).not.toBeInTheDocument();

    rerender(<BillCard bill={createMockBill({ hasPublicInterview: true })} />);
    expect(screen.getByText("AIインタビュー受付中")).toBeInTheDocument();
  });

  it("レビュー完了のときだけ完了バッジを添える", () => {
    const { rerender } = render(
      <BillCard bill={createMockBill({ is_review_completed: false })} />
    );
    expect(
      screen.queryByRole("img", { name: "レビュー完了" })
    ).not.toBeInTheDocument();

    rerender(<BillCard bill={createMockBill({ is_review_completed: true })} />);
    expect(
      screen.getByRole("img", { name: "レビュー完了" })
    ).toBeInTheDocument();
  });

  it("提出日を time 要素で出す", () => {
    const { container } = render(
      <BillCard bill={createMockBill({ submitted_date: "2026-02-03" })} />
    );

    expect(container.querySelector("time")).toHaveTextContent("2026.2.3 提出");
  });

  /*
    日付そのものの有無で見る。文字列で否定すると、同じカードにある
    ステータスバッジの「議案提出前」「議案成立」まで拾ってしまう。
  */
  it("提出日が無ければ日付を出さない", () => {
    const { container } = render(
      <BillCard bill={createMockBill({ submitted_date: null })} />
    );

    expect(container.querySelector("time")).not.toBeInTheDocument();
  });
});
