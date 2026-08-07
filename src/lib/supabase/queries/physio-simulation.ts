// This is a MOCK implementation, backed by an in-memory store instead of
// Supabase. Function names/signatures are shaped to be a near drop-in swap
// for real `supabase.functions.invoke(...)`/`.from(...)` calls later -- see
// the "Backend-integration seam" note in the physio-simulation plan. Every
// function is async and simulates network latency via `delay()`, and each
// hook that calls these omits a `supabase` client param for now; re-adding
// it is the main thing that changes when this is swapped for the real thing.
import { MOCK_PHYSIO_SCENARIOS, getPhysioScenarioById } from 'src/lib/mock/physio-scenarios';
// types
import type {
  IHypothesis,
  IPhysioAttempt,
  IPhysioMessage,
  IPhysioReport,
  IPhysioRubric,
  IPerformedTest,
  IAvailableTest,
  IPhysioScoreBreakdown,
  PhysioBodyRegion,
} from 'src/types/physio-simulation';

// ----------------------------------------------------------------------
// In-memory mock "database"
// ----------------------------------------------------------------------

type AttemptRecord = {
  attempt: IPhysioAttempt;
  scenarioId: string;
  messages: IPhysioMessage[];
  hypotheses: IHypothesis[];
  performedTests: IPerformedTest[];
  report: IPhysioReport | null;
};

const store = new Map<string, AttemptRecord>();

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function delay(min = 300, max = 700) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRecord(attemptId: string): AttemptRecord {
  const record = store.get(attemptId);
  if (!record) throw new Error('Attempt not found');
  return record;
}

// ----------------------------------------------------------------------
// Reads
// ----------------------------------------------------------------------

export async function fetchPhysioRegions(): Promise<PhysioBodyRegion[]> {
  await delay();
  const regions = new Set(
    MOCK_PHYSIO_SCENARIOS.filter((scenario) => scenario.status === 'approved').map((scenario) => scenario.region)
  );
  return Array.from(regions);
}

export async function fetchPhysioAttempts(): Promise<IPhysioAttempt[]> {
  await delay();
  return Array.from(store.values())
    .map((record) => record.attempt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function fetchPhysioAttemptById(attemptId: string): Promise<IPhysioAttempt> {
  await delay();
  return getRecord(attemptId).attempt;
}

export async function fetchPhysioAttemptMessages(attemptId: string): Promise<IPhysioMessage[]> {
  await delay();
  return getRecord(attemptId).messages;
}

export async function fetchPhysioAttemptHypotheses(attemptId: string): Promise<IHypothesis[]> {
  await delay();
  return getRecord(attemptId).hypotheses;
}

export async function fetchPhysioAttemptPerformedTests(attemptId: string): Promise<IPerformedTest[]> {
  await delay();
  return getRecord(attemptId).performedTests;
}

/** Findings are withheld until a test is actually performed -- see performSpecialTest(). */
export async function fetchPhysioTestBank(attemptId: string): Promise<IAvailableTest[]> {
  await delay();
  const record = getRecord(attemptId);
  const scenario = getPhysioScenarioById(record.scenarioId);
  if (!scenario) throw new Error('Scenario not found');
  return scenario.testBank.map(({ id, name, category, region, briefInstruction }) => ({
    id,
    name,
    category,
    region,
    briefInstruction,
  }));
}

export async function fetchPhysioReportScores(): Promise<Record<string, number>> {
  await delay();
  return Object.fromEntries(
    Array.from(store.values())
      .filter((record) => record.report)
      .map((record) => [record.attempt.id, record.report!.overallScore])
  );
}

export async function fetchPhysioAttemptReport(attemptId: string): Promise<IPhysioReport | null> {
  await delay();
  return getRecord(attemptId).report;
}

// ----------------------------------------------------------------------
// Writes
// ----------------------------------------------------------------------

type StartPhysioAttemptResult = {
  attemptId: string;
  region: PhysioBodyRegion;
  personaName: string;
  message: IPhysioMessage;
};

export async function startPhysioAttempt(region: PhysioBodyRegion): Promise<StartPhysioAttemptResult> {
  await delay();

  const candidates = MOCK_PHYSIO_SCENARIOS.filter((s) => s.region === region && s.status === 'approved');
  const scenario = candidates[Math.floor(Math.random() * candidates.length)];
  if (!scenario) throw new Error(`No cases available for ${region}`);

  const attemptId = uid('physio_attempt');
  const now = new Date().toISOString();

  const openingMessage: IPhysioMessage = {
    id: uid('msg'),
    attemptId,
    role: 'patient',
    content: scenario.openingLine,
    createdAt: now,
  };

  const attempt: IPhysioAttempt = {
    id: attemptId,
    region: scenario.region,
    personaName: scenario.personaName,
    presentingComplaint: scenario.presentingComplaint,
    phase: 'subjective',
    diagnosisText: null,
    reasoningText: null,
    startedAt: now,
    submittedAt: null,
    timerStartedAt: null,
    durationSeconds: null,
  };

  store.set(attemptId, {
    attempt,
    scenarioId: scenario.id,
    messages: [openingMessage],
    hypotheses: [],
    performedTests: [],
    report: null,
  });

  return { attemptId, region: scenario.region, personaName: scenario.personaName, message: openingMessage };
}

/** Idempotent -- first call sets timerStartedAt, later calls (e.g. resuming) just return it. */
export async function startPhysioAttemptTimer(attemptId: string): Promise<string> {
  await delay(100, 200);
  const record = getRecord(attemptId);
  if (!record.attempt.timerStartedAt) {
    record.attempt.timerStartedAt = new Date().toISOString();
  }
  return record.attempt.timerStartedAt;
}

type SendPhysioMessageResult = {
  studentMessage: IPhysioMessage;
  patientMessage: IPhysioMessage;
};

export async function sendPhysioMessage(attemptId: string, content: string): Promise<SendPhysioMessageResult> {
  await delay();
  const record = getRecord(attemptId);
  const scenario = getPhysioScenarioById(record.scenarioId);
  if (!scenario) throw new Error('Scenario not found');

  const lowerContent = content.toLowerCase();
  const scriptLine = scenario.subjectiveScript.find((line) =>
    line.keywords.some((keyword) => lowerContent.includes(keyword))
  );

  const studentMessage: IPhysioMessage = {
    id: uid('msg'),
    attemptId,
    role: 'student',
    content,
    createdAt: new Date().toISOString(),
  };

  const patientMessage: IPhysioMessage = {
    id: uid('msg'),
    attemptId,
    role: 'patient',
    content: scriptLine?.reply ?? scenario.fallbackReply,
    createdAt: new Date().toISOString(),
  };

  record.messages.push(studentMessage, patientMessage);

  return { studentMessage, patientMessage };
}

type RecordHypothesesResult = {
  hypotheses: IHypothesis[];
  phase: IPhysioAttempt['phase'];
};

export async function recordHypotheses(attemptId: string, hypotheses: string[]): Promise<RecordHypothesesResult> {
  await delay(150, 350);
  const record = getRecord(attemptId);

  record.hypotheses = hypotheses
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ id: uid('hyp'), text, createdAt: new Date().toISOString() }));

  if (record.attempt.phase === 'subjective') {
    record.attempt.phase = 'hypotheses';
  }

  return { hypotheses: record.hypotheses, phase: record.attempt.phase };
}

export async function advanceToExam(attemptId: string): Promise<{ phase: IPhysioAttempt['phase'] }> {
  await delay(100, 200);
  const record = getRecord(attemptId);
  if (record.hypotheses.length === 0) throw new Error('Record at least one hypothesis before proceeding');
  record.attempt.phase = 'exam';
  return { phase: record.attempt.phase };
}

export async function performSpecialTest(attemptId: string, testId: string): Promise<IPerformedTest> {
  await delay();
  const record = getRecord(attemptId);

  const existing = record.performedTests.find((t) => t.testId === testId);
  if (existing) return existing;

  const scenario = getPhysioScenarioById(record.scenarioId);
  if (!scenario) throw new Error('Scenario not found');

  const definition = scenario.testBank.find((t) => t.id === testId);
  if (!definition) throw new Error('Test not found in this case');

  const performed: IPerformedTest = {
    id: uid('test'),
    testId: definition.id,
    testName: definition.name,
    category: definition.category,
    result: definition.expectedResult,
    resultDetail: definition.resultDetail,
    romDegrees: definition.romDegrees,
    painResponse: definition.painResponse,
    performedAt: new Date().toISOString(),
  };

  record.performedTests.push(performed);
  return performed;
}

export async function submitPhysioAttempt(
  attemptId: string,
  diagnosisText: string,
  reasoningText: string
): Promise<IPhysioReport> {
  await delay(500, 900);
  const record = getRecord(attemptId);
  const scenario = getPhysioScenarioById(record.scenarioId);
  if (!scenario) throw new Error('Scenario not found');

  const now = new Date().toISOString();

  record.attempt.diagnosisText = diagnosisText;
  record.attempt.reasoningText = reasoningText;
  record.attempt.phase = 'submitted';
  record.attempt.submittedAt = now;
  record.attempt.durationSeconds = record.attempt.timerStartedAt
    ? Math.round((Date.now() - new Date(record.attempt.timerStartedAt).getTime()) / 1000)
    : null;

  const report = scorePhysioAttempt(
    attemptId,
    scenario.rubric,
    record.messages,
    record.hypotheses,
    record.performedTests,
    diagnosisText,
    reasoningText
  );

  record.report = report;
  return report;
}

// ----------------------------------------------------------------------
// Mock scoring engine -- keyword/coverage heuristics against the rubric.
// Deliberately simple: this is placeholder logic standing in for a real
// LLM-graded scoring Edge Function.
// ----------------------------------------------------------------------

const STOPWORDS = new Set([
  'and', 'the', 'with', 'for', 'of', 'to', 'in', 'on', 'a', 'an', 'or', 'is', 'your', 'you', 'this',
]);

function topicKeywords(topic: string): string[] {
  return topic
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));
}

function textCoversTopic(text: string, topic: string): boolean {
  const words = topicKeywords(topic);
  if (words.length === 0) return false;
  return words.some((word) => text.includes(word));
}

function coverageScore(text: string, topics: string[]): { score: number; missed: string[] } {
  if (topics.length === 0) return { score: 100, missed: [] };
  const missed = topics.filter((topic) => !textCoversTopic(text, topic));
  const score = Math.round((100 * (topics.length - missed.length)) / topics.length);
  return { score, missed };
}

function diagnosisMatchScore(diagnosisText: string, correctDiagnosis: string): number {
  const diagnosisWords = new Set(topicKeywords(diagnosisText));
  const correctWords = topicKeywords(correctDiagnosis);
  if (correctWords.length === 0) return 0;
  const matched = correctWords.filter((word) => diagnosisWords.has(word)).length;
  return Math.round((100 * matched) / correctWords.length);
}

function performanceTier(overallScore: number): 'strong' | 'solid' | 'developing' {
  if (overallScore >= 80) return 'strong';
  if (overallScore >= 60) return 'solid';
  return 'developing';
}

function reasoningQualityScore(reasoningText: string, hypothesesCount: number, performedCount: number): number {
  const wordCount = reasoningText.trim().split(/\s+/).filter(Boolean).length;
  let score = 10 + Math.min(60, wordCount * 2);
  if (hypothesesCount > 0) score += 15;
  if (performedCount > 0) score += 15;
  return Math.min(100, score);
}

function scorePhysioAttempt(
  attemptId: string,
  rubric: IPhysioRubric,
  messages: IPhysioMessage[],
  hypotheses: IHypothesis[],
  performedTests: IPerformedTest[],
  diagnosisText: string,
  reasoningText: string
): IPhysioReport {
  const studentText = messages
    .filter((m) => m.role === 'student')
    .map((m) => m.content)
    .join(' ')
    .toLowerCase();

  const hypothesesText = hypotheses.map((h) => h.text).join(' ').toLowerCase();
  const performedTestIds = new Set(performedTests.map((t) => t.testId));

  const subjective = coverageScore(studentText, rubric.subjectiveKeyQuestions);
  const redFlags = coverageScore(studentText, rubric.redFlagQuestions);
  const hypothesisCoverage = coverageScore(hypothesesText, rubric.expectedHypotheses);

  const discriminatingTotal = rubric.discriminatingTestIds.length || 1;
  const discriminatingCovered = rubric.discriminatingTestIds.filter((id) => performedTestIds.has(id)).length;
  const irrelevantPerformed = performedTests.filter((t) => rubric.irrelevantTestIds.includes(t.testId));
  const testSelectionScore = Math.max(
    0,
    Math.min(100, Math.round((100 * discriminatingCovered) / discriminatingTotal) - irrelevantPerformed.length * 15)
  );

  const reasoningLower = reasoningText.toLowerCase();
  const mentionsCorrectDiagnosis = textCoversTopic(reasoningLower, rubric.correctDiagnosis);
  const testMentionRatio = performedTests.length
    ? performedTests.filter((t) => reasoningLower.includes(t.testName.toLowerCase().split(' ')[0])).length /
      performedTests.length
    : 0;
  const findingInterpretationScore = Math.min(
    100,
    50 + (mentionsCorrectDiagnosis ? 20 : 0) + Math.round(30 * testMentionRatio)
  );

  const diagnosticAccuracy = diagnosisMatchScore(diagnosisText, rubric.correctDiagnosis);
  const clinicalReasoningScore = reasoningQualityScore(reasoningText, hypotheses.length, performedTests.length);

  const scoreBreakdown: IPhysioScoreBreakdown = {
    subjectiveHistoryScore: subjective.score,
    hypothesisGenerationScore: hypothesisCoverage.score,
    testSelectionScore,
    findingInterpretationScore,
    redFlagScore: redFlags.score,
    diagnosticAccuracy,
    clinicalReasoningScore,
  };

  const overallScore = Math.round(
    Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0) / Object.values(scoreBreakdown).length
  );

  const tier = performanceTier(overallScore);

  const summaryText =
    diagnosticAccuracy >= 60
      ? `A ${tier} attempt -- your clinical impression aligns well with the expected diagnosis (${rubric.correctDiagnosis}).`
      : `A ${tier} attempt overall, though your final impression didn't fully align with the expected diagnosis (${rubric.correctDiagnosis}).`;

  const feedbackParts: string[] = [];
  if (subjective.missed.length > 0) {
    feedbackParts.push('Some subjective history areas were left unexplored -- see the questions listed below.');
  }
  if (irrelevantPerformed.length > 0) {
    feedbackParts.push(
      `${irrelevantPerformed.length} test(s) performed were low-yield for this presentation -- aim to select tests that discriminate between your hypotheses.`
    );
  }
  if (hypothesisCoverage.missed.length > 0) {
    feedbackParts.push('Consider broadening your differential before moving to the physical exam next time.');
  }
  if (feedbackParts.length === 0) {
    feedbackParts.push('Well-rounded clinical reasoning from history through to diagnosis -- keep it up.');
  }

  return {
    id: uid('report'),
    attemptId,
    overallScore,
    scoreBreakdown,
    summaryText,
    missedKeyQuestions: subjective.missed,
    missedRedFlags: redFlags.missed,
    missedHypotheses: hypothesisCoverage.missed,
    unnecessaryTestsPerformed: irrelevantPerformed.map((t) => t.testName),
    feedbackText: feedbackParts.join(' '),
    createdAt: new Date().toISOString(),
  };
}
