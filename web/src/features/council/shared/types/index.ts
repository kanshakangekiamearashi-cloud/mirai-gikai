export type AnswerStatus = "summary_published" | "not_published";

export type GeneralQuestion = {
  id: string;
  diet_session_id: string;
  speaker_name: string;
  speaker_faction: string;
  asked_on: string;
  seq: number;
  topic: string;
  answer_summary: string | null;
  answer_source: string | null;
  answer_status: AnswerStatus;
  created_at: string;
  updated_at: string;
};

export type CouncilMemberRole = "chair" | "vice_chair" | "member";

export type CouncilMember = {
  id: string;
  diet_session_id: string;
  name: string;
  reading: string;
  faction: string;
  role: CouncilMemberRole;
  seq: number;
  created_at: string;
  updated_at: string;
};

export type BillCommitteeQa = {
  id: string;
  bill_id: string;
  question_summary: string;
  answer_summary: string;
  source: string;
  seq: number;
  created_at: string;
  updated_at: string;
};
