import type { BillStatusEnum } from "../types";

/** カード用の簡略化されたステータスラベルを取得 */
export function getCardStatusLabel(status: BillStatusEnum): string {
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "市議会審議中";
    case "enacted":
      return "議案成立";
    case "rejected":
      return "否決";
    case "reported":
      return "報告";
    default:
      return "議案提出前";
  }
}

/** ステータスに対応するBadgeのvariantを取得 */
export function getStatusVariant(
  status: BillStatusEnum
): "light" | "default" | "dark" | "muted" {
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "light";
    case "enacted":
      return "default";
    case "rejected":
      return "dark";
    // reported（報告）と preparing（提出前）は控えめな表示にする
    default:
      return "muted";
  }
}
