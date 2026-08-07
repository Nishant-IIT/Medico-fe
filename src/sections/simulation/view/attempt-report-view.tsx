'use client';

import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchAttemptById, fetchAttemptReport, fetchAttemptMessages } from 'src/lib/supabase/queries/simulation';
// utils
import { fElapsed } from 'src/utils/format-time';
// types
import type { IAttempt, IReport, IMessage } from 'src/types/simulation';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
//
import MessageBubble from '../message-bubble';

// ----------------------------------------------------------------------

const SCORE_ROWS: { key: keyof IReport['scoreBreakdown']; label: string }[] = [
  { key: 'diagnosticAccuracy', label: 'Diagnostic accuracy' },
  { key: 'historyTakingScore', label: 'History taking' },
  { key: 'redFlagScore', label: 'Red flags' },
  { key: 'differentialReasoning', label: 'Differential reasoning' },
  { key: 'communicationScore', label: 'Communication' },
];

function scoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 75) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

type Props = {
  attemptId: string;
};

export default function AttemptReportView({ attemptId }: Props) {
  const settings = useSettingsContext();

  const supabase = useMemo(() => createClient(), []);

  const [attempt, setAttempt] = useState<IAttempt | null>(null);
  const [report, setReport] = useState<IReport | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAttemptById(supabase, attemptId),
      fetchAttemptReport(supabase, attemptId),
      fetchAttemptMessages(supabase, attemptId),
    ])
      .then(([attemptData, reportData, messagesData]) => {
        setAttempt(attemptData);
        setReport(reportData);
        setMessages(messagesData);
      })
      .finally(() => setLoading(false));
  }, [supabase, attemptId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!attempt || !report) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'md'}>
        <Typography>This attempt hasn&apos;t been submitted yet.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'md'}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">
          {attempt.personaName} — {attempt.bodyPart}
        </Typography>

        {attempt.durationSeconds != null && (
          <Chip
            icon={<Iconify icon="solar:clock-circle-bold" />}
            label={`Time taken: ${fElapsed(attempt.durationSeconds)}`}
            variant="soft"
          />
        )}
      </Stack>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 4 }}>{attempt.presentingComplaint}</Typography>

      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 4 }}>
        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'baseline' }}>
            <Typography variant="h2">{report.overallScore}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              / 100 overall
            </Typography>
          </Stack>

          {SCORE_ROWS.map((row) => (
            <Box key={row.key} sx={{ mb: 2 }}>
              <Stack direction="row" sx={{ mb: 0.5, justifyContent: 'space-between' }}>
                <Typography variant="body2">{row.label}</Typography>
                <Typography variant="body2">{report.scoreBreakdown[row.key]}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={report.scoreBreakdown[row.key]}
                color={scoreColor(report.scoreBreakdown[row.key])}
              />
            </Box>
          ))}
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {report.summaryText}
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Feedback
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {report.feedbackText}
          </Typography>

          {report.missedKeyQuestions.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Questions you missed
              </Typography>
              <Stack direction="row" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {report.missedKeyQuestions.map((q) => (
                  <Chip key={q} label={q} size="small" variant="soft" color="warning" />
                ))}
              </Stack>
            </>
          )}

          {report.missedRedFlags.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Red flags you missed
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {report.missedRedFlags.map((flag) => (
                  <Chip key={flag} label={flag} size="small" variant="soft" color="error" />
                ))}
              </Stack>
            </>
          )}
        </Card>
      </Stack>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Conversation
      </Typography>

      <Card sx={{ p: 3 }}>
        <Scrollbar sx={{ maxHeight: 400 }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} personaName={attempt.personaName} />
          ))}
        </Scrollbar>
      </Card>

      <Divider sx={{ mt: 4 }} />
    </Container>
  );
}
