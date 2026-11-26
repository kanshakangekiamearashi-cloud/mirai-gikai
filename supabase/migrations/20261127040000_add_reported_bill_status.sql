-- Add 'reported' status to bill_status_enum
-- 市議会の報告案件（議決対象外の報告）を表すステータスを追加する。
-- 報告を 'enacted' で代用すると「成立」と誤表示されるため、専用の値を持つ。
ALTER TYPE bill_status_enum ADD VALUE 'reported';
