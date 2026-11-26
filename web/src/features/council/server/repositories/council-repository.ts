import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type {
  BillCommitteeQa,
  CouncilMember,
  GeneralQuestion,
} from "../../shared/types";

/**
 * 会期の一般質問を登壇順に取得
 */
export async function findGeneralQuestionsBySessionId(
  sessionId: string
): Promise<GeneralQuestion[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("general_questions")
    .select("*")
    .eq("diet_session_id", sessionId)
    .order("seq", { ascending: true });

  if (error) {
    console.error("Failed to fetch general questions:", error);
    return [];
  }

  return data;
}

/**
 * 議案の委員会質疑を掲載順に取得
 */
export async function findCommitteeQaByBillId(
  billId: string
): Promise<BillCommitteeQa[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bill_committee_qa")
    .select("*")
    .eq("bill_id", billId)
    .order("seq", { ascending: true });

  if (error) {
    console.error("Failed to fetch committee Q&A:", error);
    return [];
  }

  return data;
}

/**
 * 会期の議員名簿を掲載順に取得
 */
export async function findCouncilMembersBySessionId(
  sessionId: string
): Promise<CouncilMember[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_members")
    .select("*")
    .eq("diet_session_id", sessionId)
    .order("seq", { ascending: true });

  if (error) {
    console.error("Failed to fetch council members:", error);
    return [];
  }

  return data;
}
