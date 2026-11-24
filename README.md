# みらい議会＠東広島市

> [!IMPORTANT]
> **これは政党チームみらいが運営しているものではありません。**
> 「みらい議会＠東広島市」は、[team-mirai/mirai-gikai](https://github.com/team-mirai/mirai-gikai) をフォークして改修した、非公式の個人運営サービスです（フォーク改修日: 2026-11-24、AGPL-3.0 第5条(a) に基づく変更の明示）。
>
> - フォーク版ソースコード（本リポジトリ）: https://github.com/kanshakangekiamearashi-cloud/mirai-gikai
> - 本家「みらい議会」: https://gikai.team-mir.ai/
> - フォーク元リポジトリ: https://github.com/team-mirai/mirai-gikai
> - データ出典: [東広島市議会公式サイト](https://www.city.higashihiroshima.lg.jp/shgikai/)
> - 改修内容（名称・カラー・ロゴ・免責表示・リンク先の変更、東広島市議会データの収録方針）: [HIGASHIHIROSHIMA.md](./HIGASHIHIROSHIMA.md) を参照
> - ライセンスは上流と同じ AGPL-3.0 を継承します

---
以下はフォーク元の README です。

# みらい議会（フォーク元）

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/team-mirai-volunteer/mirai-gikai)
[![codecov](https://codecov.io/gh/team-mirai/mirai-gikai/branch/develop/graph/badge.svg)](https://codecov.io/gh/team-mirai/mirai-gikai)

## セットアップ

```bash
# Supabaseの起動
npx supabase start

# 環境変数の設定（必要に応じて.envの内容を変更してください）
cp .env.example .env

# パッケージインストール
pnpm install

# SupabaseのDB初期化, 開発用シードデータのセットアップ
pnpm db:reset

# サーバー起動
pnpm dev
```

## マイグレーション

```bash
# マイグレーションファイル生成
npx supabase migration new マイグレーション名

# マイグレーション実行 & 型ファイル更新
pnpm db:migrate
```

## Adminユーザーの作成

1. Supabase Studio上で Authentication > Add User からユーザーを作成
2. Supabase Studio上で以下のSQLを実行

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = '<1で作成したユーザーのemail>';
```

> [!NOTE]
> ローカル開発環境では、`pnpm seed`（`pnpm db:reset` からも実行されます）によって `email: admin@example.com, password: admin123456` のAdminユーザーが作成されます。
> このAdminユーザーは `SUPABASE_URL` が localhost を指している場合のみ作成され、ホスト環境（staging・preview ブランチ等）には作成されません。
> メールアドレス・パスワードを変えたい場合は `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` を設定してください。

## Fork して独自サービスを運営する場合

本リポジトリを fork して独自にサービスを運営する場合は、[Fork ガイドライン](./FORK_GUIDELINES.md) を確認してください。本家サービスとの混同防止のため、ロゴ・カラー・サービス名称などの変更が必要です。
