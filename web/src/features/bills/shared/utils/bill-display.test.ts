import { describe, expect, it } from "vitest";
import {
  createMockBill,
  createMockBillContent,
} from "@/app/dev/_lib/mock-data";
import { getBillHeading, getBillSubTitle } from "./bill-display";

describe("getBillHeading", () => {
  it("plain_summary があれば難易度によらずそれを見出しにする", () => {
    const bill = createMockBill({
      plain_summary: "福富みらいベースを作るかどうかを決める議案です。",
      bill_content: createMockBillContent({
        difficulty_level: "hard",
        title:
          "東広島市福富みらいベースの設置及び管理に関する条例の制定について",
        summary: "審議結果：原案可決（令和8年第3回定例会）",
      }),
    });

    expect(getBillHeading(bill)).toBe(
      "福富みらいベースを作るかどうかを決める議案です。"
    );
  });

  it("plain_summary が無く表示中が「ふつう」なら、その要約を見出しにする", () => {
    const bill = createMockBill({
      plain_summary: null,
      bill_content: createMockBillContent({
        difficulty_level: "normal",
        summary: "やさしい一文です。",
      }),
    });

    expect(getBillHeading(bill)).toBe("やさしい一文です。");
  });

  it("plain_summary が無く表示中が「難しい」なら、要約ではなく件名を見出しにする", () => {
    const bill = createMockBill({
      plain_summary: null,
      bill_content: createMockBillContent({
        difficulty_level: "hard",
        title: "正式な件名",
        summary: "審議結果：原案可決（令和8年第3回定例会）",
      }),
    });

    expect(getBillHeading(bill)).toBe("正式な件名");
  });

  it("コンテンツが無ければ正式名称を見出しにする", () => {
    const bill = createMockBill({
      name: "学校給食法の一部を改正する法律案",
      bill_content: undefined,
      plain_summary: null,
    });

    expect(getBillHeading(bill)).toBe("学校給食法の一部を改正する法律案");
  });
});

describe("getBillSubTitle", () => {
  it("見出しがやさしい一文なら、正式な件名を添えにする", () => {
    const bill = createMockBill({
      plain_summary: "やさしい一文です。",
      bill_content: createMockBillContent({
        title: "正式な件名",
      }),
    });

    expect(getBillSubTitle(bill)).toBe("正式な件名");
  });

  it("見出しと件名が同じなら null を返す", () => {
    const bill = createMockBill({
      plain_summary: null,
      bill_content: createMockBillContent({
        difficulty_level: "hard",
        title: "正式な件名",
        summary: "審議結果：原案可決",
      }),
    });

    expect(getBillSubTitle(bill)).toBeNull();
  });

  it("コンテンツが無く見出しが正式名称そのものなら null を返す", () => {
    const bill = createMockBill({
      name: "正式名称",
      bill_content: undefined,
      plain_summary: null,
    });

    expect(getBillSubTitle(bill)).toBeNull();
  });
});
