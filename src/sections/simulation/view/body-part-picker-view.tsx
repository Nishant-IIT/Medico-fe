'use client';

import { useMemo, useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// lib
import { createClient } from 'src/lib/supabase/client';
import { startAttempt } from 'src/lib/supabase/queries/simulation';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
//
import { useScenarioBodyParts } from '../hooks/use-scenario-body-parts';

// ----------------------------------------------------------------------

const BODY_PART_ICONS: Record<string, string> = {
  stomach: 'healthicons:stomach-outline',
  chest: 'solar:heart-pulse-bold',
  head: 'solar:user-speak-rounded-bold',
};

function iconFor(bodyPart: string) {
  return BODY_PART_ICONS[bodyPart] ?? 'solar:health-bold';
}

export default function BodyPartPickerView() {
  const settings = useSettingsContext();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const supabase = useMemo(() => createClient(), []);

  const { bodyParts, loading } = useScenarioBodyParts();

  const [startingBodyPart, setStartingBodyPart] = useState<string | null>(null);

  const handlePick = useCallback(
    async (bodyPart: string) => {
      setStartingBodyPart(bodyPart);
      try {
        const { attemptId } = await startAttempt(supabase, bodyPart);
        router.push(paths.dashboard.simulation.attempt(attemptId));
      } catch (error) {
        enqueueSnackbar(error instanceof Error ? error.message : 'Failed to start case', {
          variant: 'error',
        });
        setStartingBodyPart(null);
      }
    },
    [supabase, router, enqueueSnackbar]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Start a new case</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Pick a body part. You&apos;ll be randomly assigned a patient with a problem in that area --
        chat with them to take a history, then submit your diagnosis.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {bodyParts.map((bodyPart) => (
            <Card key={bodyPart}>
              <CardActionArea
                disabled={startingBodyPart !== null}
                onClick={() => handlePick(bodyPart)}
                sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              >
                {startingBodyPart === bodyPart ? (
                  <CircularProgress size={40} />
                ) : (
                  <Iconify icon={iconFor(bodyPart)} width={40} sx={{ color: 'primary.main' }} />
                )}

                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {bodyPart}
                </Typography>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
