/**
 * 政務活動費（会派交付）の収支データ。
 * 出典: 東広島市議会公式サイト「政務活動費の収支報告」
 * （令和7年度東広島市政務活動費収支報告総括表）
 * https://www.city.higashihiroshima.lg.jp/shgikai/8/9/39969.html
 *
 * 交付額(A) は調整額(B)・辞職返還額(C) を含む交付総額。
 * 返還額は A+B−C−D（D=支出額）で、総括表の値と一致することを確認済み。
 * 支出が交付を上回った分は自己負担額として総括表に計上されている。
 */
export type SeimuKatsudohiRow = {
  faction: string;
  granted: number;
  spent: number;
  returned: number;
  selfPaid: number;
};

export const SEIMU_KATSUDOHI_R7 = {
  fiscalYearLabel: "令和7年度",
  sourceUrl: "https://www.city.higashihiroshima.lg.jp/shgikai/8/9/39969.html",
  rows: [
    {
      faction: "清新の会",
      granted: 2100000,
      spent: 2104453,
      returned: 0,
      selfPaid: 4453,
    },
    {
      faction: "創志会",
      granted: 1800000,
      spent: 1806817,
      returned: 0,
      selfPaid: 6817,
    },
    {
      faction: "市民クラブ",
      granted: 1500000,
      spent: 1437284,
      returned: 62716,
      selfPaid: 0,
    },
    {
      faction: "公明党",
      granted: 900000,
      spent: 971509,
      returned: 0,
      selfPaid: 71509,
    },
    {
      faction: "創生会",
      granted: 900000,
      spent: 913208,
      returned: 0,
      selfPaid: 13208,
    },
    {
      faction: "真政倶楽部",
      granted: 600000,
      spent: 600735,
      returned: 0,
      selfPaid: 735,
    },
    {
      faction: "未来の風",
      granted: 900000,
      spent: 589508,
      returned: 10492,
      selfPaid: 0,
    },
    {
      faction: "日本共産党",
      granted: 300000,
      spent: 299750,
      returned: 250,
      selfPaid: 0,
    },
  ] as SeimuKatsudohiRow[],
  total: { granted: 9000000, spent: 8723264, returned: 73458, selfPaid: 96722 },
};
