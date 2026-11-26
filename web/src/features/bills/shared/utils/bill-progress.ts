import type { BillStatusEnum } from "../types";

// ステップ番号マッピング
// ステップは「提出 → 審議 → 議決」の3段階。本サイトは市議会専用で
// 一院制のため、発議院・受領院の区別はステップに反映しない
// （in_originating_house / in_receiving_house はどちらも「審議」）。
const STATUS_TO_STEP: Record<BillStatusEnum, number> = {
  preparing: 0,
  introduced: 1,
  in_originating_house: 2,
  in_receiving_house: 2,
  enacted: 3,
  rejected: 3,
  // 報告は議決を経ないため、進捗バーでは「報告」の単独ステップで表示する
  // （コンポーネント側で分岐）。ここでは提出済み相当の値を持たせる。
  reported: 1,
} as const;

// プログレス比率
const PROGRESS_RATIOS = [0, 1 / 6, 3 / 6, 1] as const;

/**
 * ステータスとステータスノートからメッセージを生成する
 */
export function getStatusMessage(
  status: BillStatusEnum,
  statusNote: string | null | undefined
): string {
  if (status === "preparing") return "提出前";
  return statusNote || "";
}

/**
 * ステップ番号と現在のステップからステップの状態を判定する
 */
export function getStepState(
  stepNumber: number,
  currentStep: number,
  isPreparing: boolean
): "active" | "inactive" {
  if (isPreparing) return "inactive";
  return stepNumber <= currentStep ? "active" : "inactive";
}

/**
 * 現在のステップからプログレスバーの幅(%)を計算する
 */
export function calculateProgressWidth(currentStep: number): number {
  const ratio = PROGRESS_RATIOS[currentStep] ?? 0;
  return ratio * 100;
}

/**
 * ステータスからステップ番号を取得する
 */
export function getCurrentStep(status: BillStatusEnum): number {
  return STATUS_TO_STEP[status] ?? 0;
}
