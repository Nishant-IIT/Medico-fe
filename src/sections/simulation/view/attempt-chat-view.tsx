'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import { fetchAttemptById } from 'src/lib/supabase/queries/simulation';
// types
import type { IAttempt, IReport } from 'src/types/simulation';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSettingsContext } from 'src/components/settings';
//
import MessageBubble from '../message-bubble';
import { useAttemptChat } from '../hooks/use-attempt-chat';
import SubmitDiagnosisDialog from '../submit-diagnosis-dialog';

// ----------------------------------------------------------------------

type Props = {
  attemptId: string;
};

export default function AttemptChatView({ attemptId }: Props) {
  const settings = useSettingsContext();

  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const [attempt, setAttempt] = useState<IAttempt | null>(null);

  useEffect(() => {
    fetchAttemptById(supabase, attemptId).then(setAttempt);
  }, [supabase, attemptId]);

  const { messages, loading, sending, error, send } = useAttemptChat(attemptId, []);

  const [draft, setDraft] = useState('');

  const submitDialog = useBoolean();

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

  const isSubmitted = attempt?.status === 'submitted';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'md'}>
      <Stack direction="row" sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">
            {attempt ? `${attempt.personaName} — ${attempt.bodyPart}` : 'Loading case...'}
          </Typography>
          {attempt && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {attempt.presentingComplaint}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          disabled={!attempt || isSubmitted}
          onClick={submitDialog.onTrue}
          startIcon={<Iconify icon="solar:clipboard-check-bold" />}
        >
          Submit diagnosis
        </Button>
      </Stack>

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
