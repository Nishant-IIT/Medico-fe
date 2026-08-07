'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
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
import { createClient } from 'src/lib/supabase/client';
import { fetchAttemptById, startAttemptTimer } from 'src/lib/supabase/queries/simulation';
// utils
import { fElapsed } from 'src/utils/format-time';
// types
import type { IAttempt, IReport } from 'src/types/simulation';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
//
import MessageBubble from '../message-bubble';
import CaseIntroCard from '../case-intro-card';
import { useAttemptChat } from '../hooks/use-attempt-chat';
import SubmitDiagnosisDialog from '../submit-diagnosis-dialog';

// ----------------------------------------------------------------------

type Props = {
  attemptId: string;
};

export default function AttemptChatView({ attemptId }: Props) {
  const settings = useSettingsContext();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const supabase = useMemo(() => createClient(), []);

  const [attempt, setAttempt] = useState<IAttempt | null>(null);

  useEffect(() => {
    fetchAttemptById(supabase, attemptId).then(setAttempt);
  }, [supabase, attemptId]);

  const { messages, loading, sending, error, send } = useAttemptChat(attemptId, []);

  const [draft, setDraft] = useState('');

  const submitDialog = useBoolean();

  const isSubmitted = attempt?.status === 'submitted';

  // timer_started_at is set server-side, once, the first time the student
  // presses Start (see start_attempt_timer()). Anchoring the live timer to
  // it -- rather than to a local "hasStarted" flag -- means resuming an
  // in-progress attempt from history (a fresh page load with a fresh
  // component) continues the clock instead of restarting it.
  const hasStarted = !!attempt?.timerStartedAt;
  const showIntro = !!attempt && !isSubmitted && !hasStarted;

  const starting = useBoolean();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!attempt?.timerStartedAt || isSubmitted) return undefined;

    const startedAtMs = new Date(attempt.timerStartedAt).getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt?.timerStartedAt, isSubmitted]);

  const handleStart = useCallback(async () => {
    starting.onTrue();
    try {
      const timerStartedAt = await startAttemptTimer(supabase, attemptId);
      setAttempt((prev) => (prev ? { ...prev, timerStartedAt } : prev));
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Failed to start case', { variant: 'error' });
    } finally {
      starting.onFalse();
    }
  }, [supabase, attemptId, starting, enqueueSnackbar]);

  const handleBack = useCallback(() => {
    router.push(paths.dashboard.simulation.root);
  }, [router]);

  const handleSend = useCallback(() => {
    if (!draft.trim() || sending) return;
    send(draft.trim());
    setDraft('');
  }, [draft, sending, send]);

  const handleSubmitted = useCallback(
    (report: IReport) => {
      router.push(paths.dashboard.history.attempt(report.attemptId));
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'md'}>
      <Stack direction="row" sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">
            {attempt ? `${attempt.personaName} — ${attempt.bodyPart}` : 'Loading case...'}
          </Typography>
          {attempt && !showIntro && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {attempt.presentingComplaint}
            </Typography>
          )}
        </Box>

        {!showIntro && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {hasStarted && !isSubmitted && (
              <Chip
                icon={<Iconify icon="solar:clock-circle-bold" />}
                label={fElapsed(elapsedSeconds)}
                variant="soft"
              />
            )}

            <Button
              variant="contained"
              disabled={!attempt || isSubmitted}
              onClick={submitDialog.onTrue}
              startIcon={<Iconify icon="solar:clipboard-check-bold" />}
            >
              Submit diagnosis
            </Button>
          </Stack>
        )}
      </Stack>

      {showIntro && attempt ? (
        <CaseIntroCard attempt={attempt} starting={starting.value} onStart={handleStart} onBack={handleBack} />
      ) : (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '65vh' }}>
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
              placeholder={isSubmitted ? 'This case has already been submitted' : 'Ask the patient a question...'}
              value={draft}
              disabled={isSubmitted}
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
              disabled={isSubmitted || sending || !draft.trim()}
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
        </Card>
      )}

      {attempt && (
        <SubmitDiagnosisDialog
          open={submitDialog.value}
          onClose={submitDialog.onFalse}
          attemptId={attempt.id}
          onSubmitted={handleSubmitted}
        />
      )}
    </Container>
  );
}
