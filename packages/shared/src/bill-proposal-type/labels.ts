import type { Database } from "@mirai-gikai/supabase";

export type BillProposalType =
  Database["public"]["Enums"]["bill_proposal_type"];

// このフォークは市議会版のため、国会用語（閣法・議員立法）ではなく
// 市議会での提出主体を表すラベルにする。
export const BILL_PROPOSAL_TYPE_LABELS: Record<BillProposalType, string> = {
  cabinet: "市長提出",
  member: "議員提出",
};
