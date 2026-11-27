/**
 * トップページのセクションに何を載せるかを決める。
 *
 * タグ別セクションは、そのタグの議案を全て出す。注目やAIインタビュー受付中に
 * 出ている議案も、複数のタグに付いている議案も外さない。本家（チームみらい）の
 * トップでも、カテゴリ別セクションにはそのカテゴリの議案が注目と重なっても
 * 並ぶ。外してしまうと、議案が注目と重なっただけのタグはセクションごと
 * 消えてしまう（例: 計画タグの議案が注目に出た途端、計画のセクションが無い）。
 *
 * 重複を避けるのは、チャットの文脈に渡す shownBills を組み立てるところだけ。
 * 画面に出ている議案の集合としては1件にまとめる必要があるため。
 */

interface PickHomeSectionsInput<
  TBill extends { id: string },
  TGroup extends { bills: TBill[] },
> {
  /** タグ別セクションの元データ。表示順（優先度順）に並んでいる前提。 */
  billsByTag: readonly TGroup[];
  /** 注目セクションに出す議案。 */
  featuredBills: readonly TBill[];
  /** AIインタビュー受付中セクションに出す議案。 */
  interviewOpenBills: readonly TBill[];
}

interface PickHomeSectionsResult<TBill, TGroup> {
  /**
   * タグ別セクションに出すグループ。各タグの議案を全て含む。議案が1件も
   * 無いタグは、見出しだけが残るので含まない。
   */
  tagGroups: TGroup[];
  /** 画面に出ている議案を重複なく並べたもの。チャットの文脈に渡す。 */
  shownBills: TBill[];
  /** 注目として出ている議案のID。 */
  featuredBillIds: Set<string>;
}

export function pickHomeSections<
  TBill extends { id: string },
  TGroup extends { bills: TBill[] },
>({
  billsByTag,
  featuredBills,
  interviewOpenBills,
}: PickHomeSectionsInput<TBill, TGroup>): PickHomeSectionsResult<
  TBill,
  TGroup
> {
  // 注目セクションに出すかどうかは呼び出し側が決める。ここに渡された
  // featuredBills は常に画面に出ているものとして扱う。
  const shownFeaturedBills = featuredBills;
  const featuredBillIds = new Set(shownFeaturedBills.map((bill) => bill.id));

  // タグ別はタグの議案をそのまま全て出す。他のセクションや先に並ぶタグに
  // 出た議案も外さない。議案が1件も無いタグだけ落とす。
  const tagGroups = billsByTag.filter((group) => group.bills.length > 0);

  // 受付中・注目・タグ別は重なるので、IDで一意にする。
  const shownBills = [
    ...new Map(
      [
        ...interviewOpenBills,
        ...shownFeaturedBills,
        ...tagGroups.flatMap((group) => group.bills),
      ].map((bill) => [bill.id, bill])
    ).values(),
  ];

  return { tagGroups, shownBills, featuredBillIds };
}
