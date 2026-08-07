// ----------------------------------------------------------------------

export type PhysioBodyRegion =
  | 'shoulder'
  | 'knee'
  | 'lumbar_spine'
  | 'hip'
  | 'ankle_foot'
  | 'cervical_spine'
  | 'elbow_wrist';

export type PhysioAttemptPhase = 'subjective' | 'hypotheses' | 'exam' | 'diagnosis' | 'submitted';

export type SpecialTestCategory = 'special_test' | 'rom' | 'palpation';

export type TestFindingResult = 'positive' | 'negative' | 'inconclusive';

export type PainResponse = 'none' | 'mild' | 'moderate' | 'severe';

// ---- Authoring / scenario content ----------------------------------------

/**
 * One entry in a scenario's test bank -- what CAN be performed, and what it
 * yields for THIS case. Shaped so a future teacher-authoring UI (mirroring
 * src/sections/scenarios) could produce it directly.
 */
export type ISpecialTestDefinition = {
  id: string;
  name: string;
  category: SpecialTestCategory;
  region: PhysioBodyRegion;
  briefInstruction: string;
  relevantToHypotheses: string[];
  expectedResult: TestFindingResult;
  resultDetail: string;
  romDegrees: number | null;
  painResponse: PainResponse | null;
};

export type IPhysioRubric = {
  subjectiveKeyQuestions: string[];
  redFlagQuestions: string[];
  expectedHypotheses: string[];
  discriminatingTestIds: string[];
  irrelevantTestIds: string[];
  correctDiagnosis: string;
};

/** One scripted subjective-question response, matched against the student's message by keyword. */
export type ISubjectiveScriptLine = {
  keywords: string[];
  reply: string;
};

export type IPhysioScenario = {
  id: string;
  region: PhysioBodyRegion;
  problemCode: string;
  personaName: string;
  personaSystemPrompt: string;
  presentingComplaint: string;
  openingLine: string;
  subjectiveScript: ISubjectiveScriptLine[];
  fallbackReply: string;
  testBank: ISpecialTestDefinition[];
  rubric: IPhysioRubric;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
};

// ---- Runtime attempt state -------------------------------------------------

export type PhysioMessageRole = 'student' | 'patient';

/** Deliberately field-for-field identical to IMessage so MessageBubble is reusable unchanged. */
export type IPhysioMessage = {
  id: string;
  attemptId: string;
  role: PhysioMessageRole;
  content: string;
  createdAt: string;
};

export type IHypothesis = {
  id: string;
  text: string;
  createdAt: string;
};

/** What's shown in the test picker before a test is performed -- expected findings withheld. */
export type IAvailableTest = Pick<ISpecialTestDefinition, 'id' | 'name' | 'category' | 'region' | 'briefInstruction'>;

export type IPerformedTest = {
  id: string;
  testId: string;
  testName: string;
  category: SpecialTestCategory;
  result: TestFindingResult;
  resultDetail: string;
  romDegrees: number | null;
  painResponse: PainResponse | null;
  performedAt: string;
};

export type IPhysioAttempt = {
  id: string;
  region: PhysioBodyRegion;
  personaName: string;
  presentingComplaint: string;
  phase: PhysioAttemptPhase;
  diagnosisText: string | null;
  reasoningText: string | null;
  startedAt: string;
  submittedAt: string | null;
  timerStartedAt: string | null;
  durationSeconds: number | null;
};

// ---- Report -----------------------------------------------------------------

export type IPhysioScoreBreakdown = {
  subjectiveHistoryScore: number;
  hypothesisGenerationScore: number;
  testSelectionScore: number;
  findingInterpretationScore: number;
  redFlagScore: number;
  diagnosticAccuracy: number;
  clinicalReasoningScore: number;
};

export type IPhysioReport = {
  id: string;
  attemptId: string;
  overallScore: number;
  scoreBreakdown: IPhysioScoreBreakdown;
  summaryText: string;
  missedKeyQuestions: string[];
  missedRedFlags: string[];
  missedHypotheses: string[];
  unnecessaryTestsPerformed: string[];
  feedbackText: string;
  createdAt: string;
};
