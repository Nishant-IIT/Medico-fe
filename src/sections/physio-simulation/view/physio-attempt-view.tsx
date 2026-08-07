'use client';

import { useState, useEffect, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// lib
import { fetchPhysioAttemptById, startPhysioAttemptTimer } from 'src/lib/supabase/queries/physio-simulation';
// utils
import { fElapsed } from 'src/utils/format-time';
// types
import type { IPhysioAttempt, IPhysioReport, PhysioAttemptPhase } from 'src/types/physio-simulation';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
//
import MessageBubble from '../message-bubble';
import CaseIntroCard from '../case-intro-card';
import AttemptStepper from '../attempt-stepper';
import ExamFindingsLog from '../exam-findings-log';
import SpecialTestPicker from '../special-test-picker';
import { usePhysioExam } from '../hooks/use-physio-exam';
import HypothesisListEditor from '../hypothesis-list-editor';
import { usePhysioHypotheses } from '../hooks/use-physio-hypotheses';
import SubmitImpressionDialog from '../submit-impression-dialog';
import { usePhysioAttemptChat } from '../hooks/use-physio-attempt-chat';

// ----------------------------------------------------------------------

type Props = {
  attemptId: string;
};

export default function PhysioAttemptView({ attemptId }: Props) {
  const settings = useSettingsContext();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const [attempt, setAttempt] = useState<IPhysioAttempt | null>(null);

  useEffect(() => {
    fetchPhysioAttemptById(attemptId).then((data) => {
      // Already-submitted attempts are reviewed from the report, not replayed here.
      if (data.phase === 'submitted') {
        router.replace(paths.dashboard.physioHistory.attempt(attemptId));
        return;
      }
      setAttempt(data);
    });
  }, [attemptId, router]);

  const { messages, loading, sending, error, send } = usePhysioAttemptChat(attemptId, []);
  const { hypotheses, saving: savingHypotheses, add, remove, edit, confirmAndAdvance } = usePhysioHypotheses(
    attemptId
  );
  const {
    testBank,
    performedTests,
    performingTestId,
    perform,
  } = usePhysioExam(attemptId);

  const [draft, setDraft] = useState('');

  // Local, optimistic step navigation for viewing -- forward progress that
  // matters (unlocking the exam, submitting) is still gated by
  // server-confirmed state. Initialized once the real attempt phase loads
  // so resuming an in-progress attempt lands on the right step.
  const [viewPhase, setViewPhase] = useState<PhysioAttemptPhase>('subjective');
  const [syncedInitialPhase, setSyncedInitialPhase] = useState(false);

  useEffect(() => {
    if (attempt && !syncedInitialPhase) {
      setViewPhase(attempt.phase === 'submitted' ? 'subjective' : attempt.phase);
      setSyncedInitialPhase(true);
    }
  }, [attempt, syncedInitialPhase]);

  const submitDialog = useBoolean();

  const hasStarted = !!attempt?.timerStartedAt;
  const showIntro = !!attempt && !hasStarted;

  const starting = useBoolean();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!attempt?.timerStartedAt) return undefined;

    const startedAtMs = new Date(attempt.timerStartedAt).getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt?.timerStartedAt]);

  const handleStart = useCallback(async () => {
    starting.onTrue();
    try {
      const timerStartedAt = await startPhysioAttemptTimer(attemptId);
      setAttempt((prev) => (prev ? { ...prev, timerStartedAt } : prev));
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Failed to start case', { variant: 'error' });
    } finally {
      starting.onFalse();
    }
  }, [attemptId, starting, enqueueSnackbar]);

  const handleBack = useCallback(() => {
    router.push(paths.dashboard.physioSimulation.root);
  }, [router]);

  const handleSend = useCallback(() => {
    if (!draft.trim() || sending) return;
    send(draft.trim());
    setDraft('');
  }, [draft, sending, send]);

  const handleContinueToExam = useCallback(async () => {
    try {
      await confirmAndAdvance();
      setViewPhase('exam');
    } catch {
      // error surfaced via usePhysioHypotheses' `error` state; nothing further to do here
    }
  }, [confirmAndAdvance]);

  const handleSubmitted = useCallback(
    (report: IPhysioReport) => {
      router.push(paths.dashboard.physioHistory.attempt(report.attemptId));
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'md'}>
      <Stack direction="row" sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">{attempt ? `${attempt.personaName}` : 'Loading case...'}</Typography>
          {attempt && !showIntro && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {attempt.presentingComplaint}
            </Typography>
          )}
        </Box>

        {!showIntro && hasStarted && (
          <Chip
            icon={<Iconify icon="solar:clock-circle-bold" />}
            label={fElapsed(elapsedSeconds)}
            variant="soft"
          />
        )}
      </Stack>

      {!attempt && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {attempt && showIntro && (
        <CaseIntroCard attempt={attempt} starting={starting.value} onStart={handleStart} onBack={handleBack} />
      )}

      {attempt && !showIntro && (
        <>
          <AttemptStepper phase={viewPhase} />

          {viewPhase === 'subjective' && (
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
              <Scrollbar sx={{ flexGrow: 1, p: 3 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} personaName={attempt?.personaName ?? 'Patient'} />
                  ))
                )}

                {sending && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                    {attempt?.personaName ?? 'Patient'} is typing...
                  </Typography>
                )}
              </Scrollbar>

              <Divider />

              <Stack direction="row" spacing={1} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask the patient a question..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <IconButton
                  color="primary"
                  disabled={sending || !draft.trim()}
                  onClick={handleSend}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <Iconify icon="solar:plain-bold" width={24} />
                </IconButton>
              </Stack>

              {error && (
                <Typography variant="caption" sx={{ color: 'error.main', px: 2, pb: 1 }}>
                  {error}
                </Typography>
              )}

              <Divider />

              <Stack direction="row" sx={{ p: 2, justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={() => setViewPhase('hypotheses')}>
                  Done with history &rarr;
                </Button>
              </Stack>
            </Card>
          )}

          {viewPhase === 'hypotheses' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Working differential diagnosis
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Before examining the patient, list the hypotheses you want to investigate.
              </Typography>

              <HypothesisListEditor hypotheses={hypotheses} onAdd={add} onRemove={remove} onEdit={edit} />

              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setViewPhase('subjective')}>
                  &larr; Back to history
                </Button>

                <Button
                  variant="contained"
                  disabled={hypotheses.length === 0}
                  loading={savingHypotheses}
                  onClick={handleContinueToExam}
                >
                  Continue to examination &rarr;
                </Button>
              </Stack>
            </Card>
          )}

          {viewPhase === 'exam' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Physical examination
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Select the special tests, range-of-motion measures, and palpation checks you want to perform.
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 2 }}>
                  <SpecialTestPicker
                    testBank={testBank}
                    performedTestIds={performedTests.map((t) => t.testId)}
                    performingTestId={performingTestId}
                    onPerform={perform}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Findings
                  </Typography>
                  <ExamFindingsLog performedTests={performedTests} />
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setViewPhase('hypotheses')}>
                  &larr; Back to hypotheses
                </Button>

                <Button variant="contained" onClick={() => setViewPhase('diagnosis')}>
                  Proceed to diagnosis &rarr;
                </Button>
              </Stack>
            </Card>
          )}

          {viewPhase === 'diagnosis' && attempt && (
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Ready to submit
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Hypotheses considered
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {hypotheses.map((h) => (
                      <Chip key={h.id} label={h.text} size="small" variant="soft" />
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Findings
                  </Typography>
                  <ExamFindingsLog performedTests={performedTests} maxHeight={240} />
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setViewPhase('exam')}>
                  &larr; Back to exam
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  onClick={submitDialog.onTrue}
                  startIcon={<Iconify icon="solar:clipboard-check-bold" />}
                >
                  Submit clinical impression
                </Button>
              </Stack>
            </Card>
          )}
        </>
      )}

      {attempt && (
        <SubmitImpressionDialog
          open={submitDialog.value}
          onClose={submitDialog.onFalse}
          attemptId={attempt.id}
          onSubmitted={handleSubmitted}
        />
      )}
    </Container>
  );
}
