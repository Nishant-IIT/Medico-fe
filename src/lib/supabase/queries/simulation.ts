import type { SupabaseClient } from '@supabase/supabase-js';
// types
import type { IAttempt, IMessage, IReport } from 'src/types/simulation';

// ----------------------------------------------------------------------

type AttemptRow = {
  id: string;
  body_part: string;
  persona_name: string;
  presenting_complaint: string;
  status: 'in_progress' | 'submitted';
  diagnosis_text: string | null;
  reasoning_text: string | null;
  started_at: string;
  submitted_at: string | null;
};

function mapAttemptRow(row: AttemptRow): IAttempt {
  return {
    id: row.id,
    bodyPart: row.body_part,
    personaName: row.persona_name,
    presentingComplaint: row.presenting_complaint,
    status: row.status,
    diagnosisText: row.diagnosis_text,
    reasoningText: row.reasoning_text,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
  };
}

type MessageRow = {
  id: string;
  attempt_id: string;
  role: 'student' | 'patient';
  content: string;
  created_at: string;
};

export function mapMessageRow(row: MessageRow): IMessage {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

type ReportRow = {
  id: string;
  attempt_id: string;
  overall_score: number;
  score_breakdown: IReport['scoreBreakdown'];
  summary_text: string;
  missed_key_questions: string[];
  missed_red_flags: string[];
  feedback_text: string;
  created_at: string;
};

function mapReportRow(row: ReportRow): IReport {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    overallScore: row.overall_score,
    scoreBreakdown: row.score_breakdown,
    summaryText: row.summary_text,
    missedKeyQuestions: row.missed_key_questions,
    missedRedFlags: row.missed_red_flags,
    feedbackText: row.feedback_text,
    createdAt: row.created_at,
  };
}

/** RLS scopes this to distinct body parts of currently-approved scenarios only. */
export async function fetchScenarioBodyParts(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.rpc('list_scenario_body_parts');
  if (error) throw new Error(error.message);
  return data as string[];
}

/** RLS scopes this to the calling student's own attempts. */
export async function fetchAttempts(supabase: SupabaseClient): Promise<IAttempt[]> {
  const { data, error } = await supabase
    .from('attempts')
    .select(
      'id, body_part, persona_name, presenting_complaint, status, diagnosis_text, reasoning_text, started_at, submitted_at'
    )
    .order('started_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as AttemptRow[]).map(mapAttemptRow);
}

export async function fetchAttemptById(supabase: SupabaseClient, attemptId: string): Promise<IAttempt> {
  const { data, error } = await supabase
    .from('attempts')
    .select(
      'id, body_part, persona_name, presenting_complaint, status, diagnosis_text, reasoning_text, started_at, submitted_at'
    )
    .eq('id', attemptId)
    .single();

  if (error) throw new Error(error.message);
  return mapAttemptRow(data as AttemptRow);
}

export async function fetchAttemptMessages(supabase: SupabaseClient, attemptId: string): Promise<IMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, attempt_id, role, content, created_at')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MessageRow[]).map(mapMessageRow);
}

/** Lightweight attempt_id -> overall_score lookup, for annotating the history list without a full join. */
export async function fetchReportScores(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('reports').select('attempt_id, overall_score');
  if (error) throw new Error(error.message);
  return Object.fromEntries((data as { attempt_id: string; overall_score: number }[]).map((r) => [r.attempt_id, r.overall_score]));
}

/** Returns null if the attempt hasn't been submitted/scored yet. */
export async function fetchAttemptReport(supabase: SupabaseClient, attemptId: string): Promise<IReport | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, attempt_id, overall_score, score_breakdown, summary_text, missed_key_questions, missed_red_flags, feedback_text, created_at')
    .eq('attempt_id', attemptId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapReportRow(data as ReportRow) : null;
}

type StartAttemptResult = {
  attemptId: string;
  bodyPart: string;
  personaName: string;
  message: MessageRow;
};

export async function startAttempt(supabase: SupabaseClient, bodyPart: string): Promise<StartAttemptResult> {
  const { data, error } = await supabase.functions.invoke('start-attempt', { body: { bodyPart } });
  if (error) throw new Error(error.message);
  return data as StartAttemptResult;
}

type SendMessageResult = {
  studentMessage: MessageRow;
  patientMessage: MessageRow;
};

export async function sendMessage(
  supabase: SupabaseClient,
  attemptId: string,
  content: string
): Promise<SendMessageResult> {
  const { data, error } = await supabase.functions.invoke('send-message', { body: { attemptId, content } });
  if (error) throw new Error(error.message);
  return data as SendMessageResult;
}

export async function submitAttempt(
  supabase: SupabaseClient,
  attemptId: string,
  diagnosisText: string,
  reasoningText: string
): Promise<IReport> {
  const { data, error } = await supabase.functions.invoke('submit-attempt', {
    body: { attemptId, diagnosisText, reasoningText },
  });
  if (error) throw new Error(error.message);
  return mapReportRow((data as { report: ReportRow }).report);
}
