-- 市議会向け拡張: 委員会の構成（委員会と議員の所属）を追加する。
-- 上流のスキーマは国会向けで委員会構成に対応するテーブルが存在しないため、
-- 公式ページ「正副議長・委員会等の構成」の掲載内容を表示する最小構成で新設する。
-- 役職は council_member_role_enum を再利用する
-- （chair=委員長 / vice_chair=副委員長 / member=委員）。

create table council_committees (
  id uuid primary key default gen_random_uuid(),
  diet_session_id uuid not null references diet_sessions(id) on delete cascade,
  name text not null,
  category text not null,
  as_of text not null,
  seq int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (diet_session_id, name)
);

alter table council_committees enable row level security;

create trigger update_council_committees_updated_at
  before update on council_committees
  for each row
  execute function update_updated_at_column();

create table council_member_committees (
  id uuid primary key default gen_random_uuid(),
  council_committee_id uuid not null references council_committees(id) on delete cascade,
  council_member_id uuid not null references council_members(id) on delete cascade,
  role council_member_role_enum not null default 'member',
  seq int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (council_committee_id, council_member_id)
);

alter table council_member_committees enable row level security;

create trigger update_council_member_committees_updated_at
  before update on council_member_committees
  for each row
  execute function update_updated_at_column();

comment on table council_committees is '市議会の委員会（常任委員会・議会運営委員会・広報広聴委員会等）。会期（任期）ごとに収録する';
comment on column council_committees.name is '委員会名（公式ページの記載どおり）';
comment on column council_committees.category is '区分（公式ページの見出しどおり：常任委員会 / 議会運営委員会 / 広報広聴委員会）';
comment on column council_committees.as_of is '公式ページに記載された構成の基準日（例: 令和7年6月27日現在）';
comment on column council_committees.seq is '公式ページの掲載順';

comment on table council_member_committees is '議員の委員会所属。公式ページに氏名が掲載された所属のみ収録し、未確認の所属は作らない';
comment on column council_member_committees.role is '委員会での役職（chair=委員長 / vice_chair=副委員長 / member=委員）';
comment on column council_member_committees.seq is '委員会内での掲載順（委員長・副委員長・委員の順）';
