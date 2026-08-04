import type { SupabaseClient } from '@supabase/supabase-js';
// types
import type { IScenario, ScenarioStatus, IScenarioRubric } from 'src/types/scenario';

// ----------------------------------------------------------------------

type ScenarioRow = {
  id: string;
  body_part: string;
  problem_code: string;
  persona_name: string;
  persona_system_prompt: string;
  presenting_complaint: string;
  correct_diagnosis: string;
  rubric: Partial<{ key_questions: string[]; red_flags: string[]; differentials: string[] }> | null;
  status: ScenarioStatus;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

function mapRubric(rubric: ScenarioRow['rubric']): IScenarioRubric {
  return {
    keyQuestions: rubric?.key_questions ?? [],
    redFlags: rubric?.red_flags ?? [],
    differentials: rubric?.differentials ?? [],
  };
}

function mapScenarioRow(row: ScenarioRow): IScenario {
  return {
    id: row.id,
    bodyPart: row.body_part,
    problemCode: row.problem_code,
    personaName: row.persona_name,
    personaSystemPrompt: row.persona_system_prompt,
    presentingComplaint: row.presenting_complaint,
    correctDiagnosis: row.correct_diagnosis,
    rubric: mapRubric(row.rubric),
    status: row.status,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** RLS-free RPC: returns the caller's own scenarios (teacher) or all scenarios (admin). */
export async function fetchScenarios(supabase: SupabaseClient): Promise<IScenario[]> {
  const { data, error } = await supabase.rpc('list_scenarios');
  if (error) throw new Error(error.message);
  return (data as ScenarioRow[]).map(mapScenarioRow);
}

export async function fetchKnownBodyParts(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.rpc('list_known_body_parts');
  if (error) throw new Error(error.message);
  return data as string[];
}

export type ScenarioFormValues = {
  bodyPart: string;
  problemCode: string;
  personaName: string;
  personaSystemPrompt: string;
  presentingComplaint: string;
  correctDiagnosis: string;
  rubric: IScenarioRubric;
};

function rubricToJson(rubric: IScenarioRubric) {
  return {
    key_questions: rubric.keyQuestions,
    red_flags: rubric.redFlags,
    differentials: rubric.differentials,
  };
}

export async function createScenario(supabase: SupabaseClient, values: ScenarioFormValues): Promise<IScenario> {
  const { data, error } = await supabase
    .rpc('create_scenario', {
      p_body_part: values.bodyPart,
      p_problem_code: values.problemCode,
      p_persona_name: values.personaName,
      p_persona_system_prompt: values.personaSystemPrompt,
      p_presenting_complaint: values.presentingComplaint,
      p_correct_diagnosis: values.correctDiagnosis,
      p_rubric: rubricToJson(values.rubric),
    })
    .single();

  if (error) throw new Error(error.message);
  return mapScenarioRow(data as ScenarioRow);
}

export async function updateScenario(
  supabase: SupabaseClient,
  scenarioId: string,
  values: ScenarioFormValues
): Promise<IScenario> {
  const { data, error } = await supabase
    .rpc('update_scenario', {
      p_scenario_id: scenarioId,
      p_body_part: values.bodyPart,
      p_problem_code: values.problemCode,
      p_persona_name: values.personaName,
      p_persona_system_prompt: values.personaSystemPrompt,
      p_presenting_complaint: values.presentingComplaint,
      p_correct_diagnosis: values.correctDiagnosis,
      p_rubric: rubricToJson(values.rubric),
    })
    .single();

  if (error) throw new Error(error.message);
  return mapScenarioRow(data as ScenarioRow);
}

export async function submitScenarioForApproval(supabase: SupabaseClient, scenarioId: string): Promise<IScenario> {
  const { data, error } = await supabase
    .rpc('submit_scenario_for_approval', { p_scenario_id: scenarioId })
    .single();

  if (error) throw new Error(error.message);
  return mapScenarioRow(data as ScenarioRow);
}

export async function approveScenario(supabase: SupabaseClient, scenarioId: string): Promise<IScenario> {
  const { data, error } = await supabase.rpc('approve_scenario', { p_scenario_id: scenarioId }).single();
  if (error) throw new Error(error.message);
  return mapScenarioRow(data as ScenarioRow);
}

export async function rejectScenario(
  supabase: SupabaseClient,
  scenarioId: string,
  reason: string
): Promise<IScenario> {
  const { data, error } = await supabase
    .rpc('reject_scenario', { p_scenario_id: scenarioId, p_reason: reason })
    .single();

  if (error) throw new Error(error.message);
  return mapScenarioRow(data as ScenarioRow);
}

export async function deleteScenario(supabase: SupabaseClient, scenarioId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_scenario', { p_scenario_id: scenarioId });
  if (error) throw new Error(error.message);
}
