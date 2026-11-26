-- 市議会向け拡張: 一般質問と議員名簿のテーブルを追加する。
-- 上流のスキーマは国会向けで市議会の一般質問・議員名簿に対応するテーブルが
-- 存在しないため、東広島市版の表示に必要な最小構成で新設する。

-- 答弁要旨の公開状態（summary_published = 議会だより等の要旨が公表済み /
-- not_published = 抜粋掲載がなく未確認）
create type answer_status_enum as enum ('summary_published', 'not_published');

-- 議員の役職（副議長が未確認の会期では vice_chair を誰にも付けない）
create type council_member_role_enum as enum ('chair', 'vice_chair', 'member');

create table general_questions (
  id uuid primary key default gen_random_uuid(),
  diet_session_id uuid not null references diet_sessions(id) on delete cascade,
  speaker_name text not null,
  speaker_faction text not null,
  asked_on date not null,
  seq int not null,
  topic text not null,
  answer_summary text,
  answer_source text,
  answer_status answer_status_enum not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (diet_session_id, seq)
);

alter table general_questions enable row level security;

create trigger update_general_questions_updated_at
  before update on general_questions
  for each row
  execute function update_updated_at_column();

create table council_members (
  id uuid primary key default gen_random_uuid(),
  diet_session_id uuid not null references diet_sessions(id) on delete cascade,
  name text not null,
  reading text not null,
  faction text not null,
  role council_member_role_enum not null default 'member',
  seq int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (diet_session_id, seq)
);

alter table council_members enable row level security;

create trigger update_council_members_updated_at
  before update on council_members
  for each row
  execute function update_updated_at_column();

comment on table general_questions is '市議会の一般質問（質問項目と答弁要旨）。会期ごとに登壇順で収録する';
comment on column general_questions.speaker_name is '質問者の氏名';
comment on column general_questions.speaker_faction is '質問者の会派';
comment on column general_questions.asked_on is '質問日';
comment on column general_questions.seq is '会期を通した登壇順（項目単位）';
comment on column general_questions.topic is '質問項目（通告の公式文言）';
comment on column general_questions.answer_summary is '答弁要旨（出典の要旨転記。要旨が未公表の項目は NULL）';
comment on column general_questions.answer_source is '答弁要旨の出典（例: 議会だよりvol.213）';
comment on column general_questions.answer_status is '答弁要旨の公開状態（summary_published / not_published）';

comment on table council_members is '市議会議員の名簿（氏名・読み・会派・役職）。会期（任期）ごとに収録する';
comment on column council_members.reading is '氏名の読み';
comment on column council_members.faction is '所属会派';
comment on column council_members.role is '役職（chair=議長 / vice_chair=副議長 / member=議員）。未確認の役職は付けない';
comment on column council_members.seq is '名簿の掲載順';
