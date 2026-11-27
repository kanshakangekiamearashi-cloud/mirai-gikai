-- Add 'withdrawn' status to bill_status_enum
-- 市議会の撤回承認案件（議決により撤回が承認された議案）を表すステータスを追加する。
-- 撤回承認を 'introduced' で代用すると「審議中」と誤表示されるため、専用の値を持つ。
ALTER TYPE bill_status_enum ADD VALUE 'withdrawn';
