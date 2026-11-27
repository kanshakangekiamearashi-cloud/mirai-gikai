-- 市議会向け拡張: 一般質問に「詳しく」表示用の詳細な答弁テキストを追加する。
-- answer_summary（ふつう表示・会議録／議会だよりに基づく要旨）はそのままに、
-- 難易度「hard」のときに表示する、より詳細な答弁の記録を別カラムに保持する。
-- 詳細版が無い項目（answer_detail が null）は、難易度によらず従来表示になる。

alter table general_questions add column answer_detail text;
alter table general_questions add column answer_detail_source text;

comment on column general_questions.answer_detail is '難易度「hard」表示用の詳細な答弁テキスト（出典は answer_detail_source）。null の項目は詳細版なし';
comment on column general_questions.answer_detail_source is 'answer_detail の出典（例: 会議録、議会だよりvol.213）';
