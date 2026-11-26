-- 市議会向け拡張: 委員会質疑のテーブルを追加する。
-- 上流のスキーマは国会向けで委員会質疑に対応するテーブルが存在しないため、
-- 議案詳細に質疑応答を表示する最小構成で新設する。
-- あわせて bills.status_order（生成列）に 'reported' の並び順を加える。

-- status_order: 'reported'（報告）は最後尾に置く
DROP INDEX idx_bills_status_order;
ALTER TABLE bills DROP COLUMN status_order;
ALTER TABLE bills ADD COLUMN status_order INT GENERATED ALWAYS AS (
  CASE status
    WHEN 'enacted'              THEN 0
    WHEN 'rejected'             THEN 1
    WHEN 'in_receiving_house'   THEN 2
    WHEN 'in_originating_house' THEN 3
    WHEN 'introduced'           THEN 4
    WHEN 'preparing'            THEN 5
    WHEN 'reported'             THEN 6
  END
) STORED;
CREATE INDEX idx_bills_status_order ON bills(status_order);

create table bill_committee_qa (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  question_summary text not null,
  answer_summary text not null,
  source text not null,
  seq int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bill_id, seq)
);

alter table bill_committee_qa enable row level security;

create trigger update_bill_committee_qa_updated_at
  before update on bill_committee_qa
  for each row
  execute function update_updated_at_column();

comment on table bill_committee_qa is '委員会での質疑応答の要点（出典掲載分のみ収録）。議案ごとに掲載順で収録する';
comment on column bill_committee_qa.question_summary is '質疑の要点（出典の掲載文言）';
comment on column bill_committee_qa.answer_summary is '答弁の要点（出典の掲載文言）';
comment on column bill_committee_qa.source is '出典（例: 議会だよりvol.213）';
comment on column bill_committee_qa.seq is '議案内での掲載順';
