-- bills.status_order（生成列）に 'withdrawn' の並び順を加える。
-- 20261127041000_add_bill_committee_qa.sql で 'reported' を加えた際と同じ手順で
-- 生成列を作り直す。

-- status_order: 'withdrawn'（撤回承認）は 'reported' の後ろ（最後尾）に置く
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
    WHEN 'withdrawn'            THEN 7
  END
) STORED;
CREATE INDEX idx_bills_status_order ON bills(status_order);
