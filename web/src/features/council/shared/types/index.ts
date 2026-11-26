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

export type CouncilCommittee = {
  id: string;
  diet_session_id: string;
  name: string;
  category: string;
  as_of: string;
  seq: number;
  created_at: string;
  updated_at: string;
};

export type CouncilMemberCommittee = {
  id: string;
  council_committee_id: string;
  council_member_id: string;
  role: CouncilMemberRole;
  seq: number;
  created_at: string;
  updated_at: string;
};

/** 議員1名分の委員会所属（委員会名と委員会での役職） */
export type MemberCommitteeAssignment = {
  name: string;
  role: CouncilMemberRole;
};

export type CouncilMemberWithCommittees = CouncilMember & {
  committees: MemberCommitteeAssignment[];
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
