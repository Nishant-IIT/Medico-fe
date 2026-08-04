// ----------------------------------------------------------------------

export type ScenarioStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export type IScenarioRubric = {
  keyQuestions: string[];
  redFlags: string[];
  differentials: string[];
};

export type IScenario = {
  id: string;
  bodyPart: string;
  problemCode: string;
  personaName: string;
  personaSystemPrompt: string;
  presentingComplaint: string;
  correctDiagnosis: string;
  rubric: IScenarioRubric;
  status: ScenarioStatus;
  createdBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};
