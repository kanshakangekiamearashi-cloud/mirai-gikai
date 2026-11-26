import { BILL_STATUS_ORDER, type BillStatusEnum } from "../types";

/**
 * 議案名から議案番号（「第N号」の N）を取り出す。
 *
 * 「議案第139号」「報告第14号」「委員会提出議案第6号」のような
 * 先頭の番号を対象とし、全角数字は半角にそろえる。
 * 「議員派遣について」のように番号を持たない名前は null を返す。
 */
export function extractBillNumber(name: string): number | null {
  const match = name.match(/第\s*([0-9０-９]+)\s*号/);
  if (!match) {
    return null;
  }
  const halfWidth = match[1].replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
  const num = Number.parseInt(halfWidth, 10);
  return Number.isNaN(num) ? null : num;
}

type BillListOrderTarget = {
  id: string;
  name: string;
  status: BillStatusEnum;
  submitted_date: string | null;
};

/**
 * 議案一覧の標準並び順。
 *
 * 1. 審議状況（BILL_STATUS_ORDER。DB の status_order と一致させる）
 * 2. 提出日が新しい順（null は最後尾）
 * 3. 議案番号の昇順（番号なしは最後尾）
 * 4. id 昇順
 *
 * 提出日は会期によっては全件 null になりうる（東広島市議会版の収録分が
 * 該当）。その場合でも 3 の議案番号で並びが一意に決まるため、DB の
 * 返却順に依存しない決定的な順序になる。
 */
export function compareBillListOrder(
  a: BillListOrderTarget,
  b: BillListOrderTarget
): number {
  const statusDiff = BILL_STATUS_ORDER[a.status] - BILL_STATUS_ORDER[b.status];
  if (statusDiff !== 0) {
    return statusDiff;
  }

  // 提出日なしは常に最後尾（sort-bills の bySubmittedDate と同じ扱い）
  if (!a.submitted_date && !b.submitted_date) {
    // 両方なしは議案番号で判定する
  } else if (!a.submitted_date) {
    return 1;
  } else if (!b.submitted_date) {
    return -1;
  } else {
    const dateDiff =
      Date.parse(b.submitted_date) - Date.parse(a.submitted_date);
    if (dateDiff !== 0) {
      return dateDiff;
    }
  }

  const aNum = extractBillNumber(a.name);
  const bNum = extractBillNumber(b.name);
  if (aNum === null && bNum === null) {
    return a.id.localeCompare(b.id);
  }
  if (aNum === null) {
    return 1;
  }
  if (bNum === null) {
    return -1;
  }
  if (aNum !== bNum) {
    return aNum - bNum;
  }
  return a.id.localeCompare(b.id);
}

export function sortByBillListOrder<T extends BillListOrderTarget>(
  bills: readonly T[]
): T[] {
  return [...bills].sort(compareBillListOrder);
}
