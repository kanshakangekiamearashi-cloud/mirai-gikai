# みらい議会＠東広島市 — フォーク改修記録

これは政党チームみらいが運営しているものではありません。「みらい議会＠東広島市」は、本家「みらい議会」のオープンソース [team-mirai/mirai-gikai](https://github.com/team-mirai/mirai-gikai) をフォークした、非公式の個人運営サービスです。

- フォーク版リポジトリ: https://github.com/kanshakangekiamearashi-cloud/mirai-gikai
- 本家サービス: https://gikai.team-mir.ai/
- 改修日: 2026-11-24（AGPL-3.0 第5条(a) に基づく変更の明示）
- ライセンス: AGPL-3.0（上流から継承）
- 改修方針: 上流の [FORK_GUIDELINES.md](./FORK_GUIDELINES.md) の必須要件に従う
- 備考: 本フォークは 2026-11-24 に再作成され、develop は上流クリーンな状態（head `6365c09`）だったため、東広島市版は新規に13ファイルを適用した。先行する広島市版・廿日市市版の改修コミットは現在の develop には含まれていない（各版のローカル作業記録は別途保持）。

## ガイドライン必須要件への対応

| # | 要件 | 対応 |
|---|------|------|
| 1 | サービス名称は「みらい議会＠地域名」形式 | 「みらい議会＠東広島市」に変更（`web/src/app/layout.tsx` の siteTitle / siteName / description / keywords、開発者向けページ、フッターのロゴ alt 等） |
| 2 | ロゴの変更（チームみらいのロゴ使用禁止） | `web/public/img/logo.svg` を独自ロゴ（煉瓦色 `#8c3a22` の角丸スクエア＋アンティークゴールドのリング＋「東」の文字）に差し替え。OGP用ロゴ `packages/shared/src/og/ogp-logo.png` はバイナリのため未対応（下記「未対応事項」参照） |
| 3 | トップ画像・OGP画像の変更 | バイナリ差し替えが必要なため未対応（下記参照）。OGP画像の alt テキストは東広島市版に変更済み |
| 4 | カラーテーマの変更 | `--primary` を本家の `#2aa693` から `#8c3a22`（煉瓦色＝酒蔵の赤レンガ）に、`--primary-accent` を `#582515` に、グラデーションをアンティークゴールド系（`#b9975b` → `#efe3c2`）に変更（`web/src/app/globals.css`）。`layout.tsx` の themeColor とローディングバーの色、`manifest.json` の theme_color も `#8c3a22` に統一。当初は深い藍 `#203864`／`#14243f` で公開したが、2026-11-28 にユーザーの承認で煉瓦色へ変更した。広島市版の深緑 `#175c3a`、廿日市市版の朱 `#8c2f1b` とも異なる色にした |
| 5 | 免責文言の表示 | フッターに「これは政党チームみらいが運営しているものではありません」を表示する専用セクションを追加（`web/src/components/layouts/footer/footer.tsx`）。README と開発者向けページにも併記 |
| 6 | ソースコード公開先へのリンク表示 | `web/src/config/external-links.ts` の `GITHUB_REPO` を本フォーク（https://github.com/kanshakangekiamearashi-cloud/mirai-gikai）に設定。フッター（「ソースコード（GitHub）」リンク＋免責セクション内のリンク）と開発者向けページ（`EXTERNAL_LINKS.GITHUB_REPO` 参照）から辿れる。本リポジトリは Public |

推奨事項: フッターに本家「みらい議会」（https://gikai.team-mir.ai/）とフォーク元リポジトリへのリンクを併記した。

その他の変更: フッターの著作権表記を東広島市版の運営表記に変更。フッターの主要リンクは本家・東広島市議会公式サイト・ソースコードへのリンクとした。

## 未対応事項（バイナリ差し替えが必要なもの）

GitHub 連携（push_files）の制約により、バイナリファイルはこの改修では差し替えていない。いずれも本家の画像が残っているため、公開運用の前に必ず差し替えること。

- `web/public/img/hero_background.png`（ヒーロー画像）
- `web/public/ogp.jpg`（OGP画像）
- `packages/shared/src/og/ogp-logo.png`（OGP用ロゴ）
- `web/public/icons/` 配下の favicon / PWA アイコン

## 東広島市議会データの収録

### 収録範囲（2026-11-24 に東広島市議会公式サイトで確認）

- 最新の終了した定例会: **令和8年第3回定例会（2026年8月31日〜10月7日、38日間）**
  - 第4回定例会は 2026年11月27日開会予定で、2026-11-24 時点では未開会のため対象外。
- 議決案件: **28件**（市長提出24件＝承認案第133号、諮問第134〜136号、同意案第137・138号、議案第139〜156号／委員会提出議案第6〜8号／議長発議「議員派遣について」）。ほかに報告事項7件（報告第14〜20号、議決対象外）を別枠で収録。議員提出議案は本定例会の公式一覧に掲載なし。
  - 議案第139号・第147号は賛成多数（賛成26・反対1・欠席1、議長・奥谷求を除く。反対＝谷晴美、欠席＝片山貴志。市議会だより vol.213 の議員別表決表による）。
  - 上記2件以外の案件ごとの全会一致／賛成多数の別は公式に公表されていないため、未確認として扱い明記していない。
  - 請願・陳情は公式一覧に区分掲載がなく、有無と結果は未確認（掲載が無いことをもって「0件」とは断定していない）。
- 一般質問: 2026年9月8日〜11日に **21名・40項目** が登壇。登壇順・氏名・会派・質問項目を公式「一般質問通告内容」と通告者一覧表PDF、公式「会派の構成」で照合済み。各項目への市の答弁の逐語・正確な要旨は、本会議会議録（第3回定例会分）が未公開のため未確認（市議会だより vol.213 に抜粋Q&A要約はあるが、多段組PDFのため逐語検証には目視確認が必要で転記していない）。
- 委員会質疑: 市議会だより vol.213 の公式掲載に基づき、委員会提出議案第6号・第7号の趣旨、文教厚生委員会（議案第143号）、市民経済委員会（議案第147号、本会議討論・表決を含む）、決算特別委員会の要点を、判読できた範囲で議事ベースに収録。決算特別委員会の分科会ごとの質疑要点と議案第143号の答弁詳細は未確認。
- 議員名簿: 現員 **29名**。全員の漢字氏名・読み・会派を公式名簿と「会派の構成」（令和8年6月23日現在）で照合（清新の会7／創志会6／市民クラブ5／公明党3／創生会3／真政倶楽部2／未来の風2／日本共産党1＝29名）。議長は奥谷求（創志会）。副議長名は収集範囲の出典では未確認。公式名簿に選挙区欄はないため選挙区は収録していない。議員定数と現員29名との差異（欠員の有無）は公式ページに明記がなく未確認。

### データの置き場所と形式

収録データは `packages/seed/higashihiroshima/` に置く。

- `bills_rows.csv` — 議案一覧（会期・議案番号・件名・結果。議決案件28件＋報告事項7件）
- `members_rows.csv` — 議員名簿（氏名・読み・会派）
- `general_questions.md` — 一般質問と委員会質疑（確認できた範囲と未確認事項）

### なぜ DB seed（packages/seed/main や supabase/seed.sql）に直接入れていないか

上流の DB スキーマは国会向け（`diet_sessions` / `bills` / `bill_contents` / `mirai_stances` / `tags` / `interview_*`）で、市議会の一般質問・議員名簿に対応するテーブルが存在しない。スキーマを無理に流用すると意味の違うデータが混入するため、今回は公式確認済みデータを上記の独立ファイルとして収録し、DB 取り込みは管理画面（admin）経由の投入または市議会向けスキーマ追加を行ってから実施する。取り込み時も、未確認の答弁文言・各案件の全会一致／賛成多数の別・請願陳情の有無は公式資料で再照合してから投入すること。

### 出典（東広島市議会公式サイト）

- 令和8年第3回定例会ページ（日程・一般質問通告・議案一覧・議決状況・報告事項）: https://www.city.higashihiroshima.lg.jp/shgikai/11/1/reiwa08/45464.html
- 令和8年第4回定例会ページ（11月27日開会予定の確認用）: https://www.city.higashihiroshima.lg.jp/shgikai/11/1/reiwa08/46090.html
- 一般質問通告者一覧表 9月8日: https://www.city.higashihiroshima.lg.jp/material/files/group/66/R8-3teiippanshitsumon1.pdf
- 一般質問通告者一覧表 9月9日: https://www.city.higashihiroshima.lg.jp/material/files/group/66/R8-3teiippanshitsumon2.pdf
- 一般質問通告者一覧表 9月10日: https://www.city.higashihiroshima.lg.jp/material/files/group/66/R8-3teiippanshitsumon3.pdf
- 一般質問通告者一覧表 9月11日: https://www.city.higashihiroshima.lg.jp/material/files/group/66/R8-3teiippanshitsumon4.pdf
- 議案書（その2・決算155・156号）: https://www.city.higashihiroshima.lg.jp/material/files/group/66/R8-3teigian2.pdf
- 市議会だより vol.213 全体版: https://www.city.higashihiroshima.lg.jp/material/files/group/66/213zentai.pdf
- 市議会だより vol.213 議決案件ページ: https://www.city.higashihiroshima.lg.jp/material/files/group/66/213giketsuannkenn.pdf
- 議員名簿: https://www.city.higashihiroshima.lg.jp/shgikai/3/2860.html
- 会派の構成: https://www.city.higashihiroshima.lg.jp/shgikai/4/2450.html

## デプロイについて

本リポジトリにはホスティング設定（Vercel / Cloud Run 等の東広島市版プロジェクト）が含まれていないため、この改修で完了したのは「ソースコードの公開（Public リポジトリへの push）」まで。公開ページのホスティングは未設定であり、別途デプロイ先を用意する必要がある。
