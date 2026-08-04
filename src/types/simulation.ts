// ----------------------------------------------------------------------

export type AttemptStatus = 'in_progress' | 'submitted';

export type MessageRole = 'student' | 'patient';

export type IAttempt = {
  id: string;
  bodyPart: string;
  personaName: string;
  presentingComplaint: string;
  status: AttemptStatus;
  diagnosisText: string | null;
  reasoningText: string | null;
  startedAt: string;
  submittedAt: string | null;
};

export type IMessage = {
  id: string;
  attemptId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type IScoreBreakdown = {
  diagnosticAccuracy: number;
  historyTakingScore: number;
  redFlagScore: number;
  differentialReasoning: number;
  communicationScore: number;
};

export type IReport = {
  id: string;
  attemptId: string;
  overallScore: number;
  scoreBreakdown: IScoreBreakdown;
  summaryText: string;
  missedKeyQuestions: string[];
  missedRedFlags: string[];
  feedbackText: string;
  createdAt: string;
};
