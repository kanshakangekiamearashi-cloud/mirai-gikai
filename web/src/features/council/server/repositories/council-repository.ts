import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type {
  BillCommitteeQa,
  CouncilCommittee,
  CouncilMember,
  CouncilMemberCommittee,
  CouncilQuestionVideo,
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
 * 会期の一般質問・代表質問の公式動画リンクを取得
 */
export async function findQuestionVideosBySessionId(
  sessionId: string
): Promise<CouncilQuestionVideo[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_question_videos")
    .select("*")
    .eq("diet_session_id", sessionId)
    .order("asked_on", { ascending: true });

  if (error) {
    console.error("Failed to fetch question videos:", error);
    return [];
  }

  return data;
}

/**
 * 会期の委員会を公式ページの掲載順に取得
 */
export async function findCouncilCommitteesBySessionId(
  sessionId: string
): Promise<CouncilCommittee[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_committees")
    .select("*")
    .eq("diet_session_id", sessionId)
    .order("seq", { ascending: true });

  if (error) {
    console.error("Failed to fetch council committees:", error);
    return [];
  }

  return data;
}

/**
 * 委員会ID群に対する議員の所属を取得
 */
export async function findMemberCommitteesByCommitteeIds(
  committeeIds: string[]
): Promise<CouncilMemberCommittee[]> {
  if (committeeIds.length === 0) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_member_committees")
    .select("*")
    .in("council_committee_id", committeeIds)
    .order("seq", { ascending: true });

  if (error) {
    console.error("Failed to fetch council member committees:", error);
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
 * 複数のbill_idのうち、委員会質疑が登録されている議案のIDを一括取得する
 */
export async function findBillIdsWithCommitteeQa(
  billIds: string[]
): Promise<Set<string>> {
  if (billIds.length === 0) {
    return new Set();
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bill_committee_qa")
    .select("bill_id")
    .in("bill_id", billIds);

  if (error) {
    console.error("Failed to fetch bill ids with committee Q&A:", error);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.bill_id));
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
