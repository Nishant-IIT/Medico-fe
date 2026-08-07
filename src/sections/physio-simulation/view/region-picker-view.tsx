'use client';

import { useState, useCallback } from 'react';
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
import { startPhysioAttempt } from 'src/lib/supabase/queries/physio-simulation';
// types
import type { PhysioBodyRegion } from 'src/types/physio-simulation';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
//
import { usePhysioBodyRegions } from '../hooks/use-physio-body-regions';

// ----------------------------------------------------------------------

const REGION_ICONS: Record<PhysioBodyRegion, string> = {
  shoulder: 'solar:accessibility-bold',
  knee: 'solar:running-round-bold',
  lumbar_spine: 'solar:bone-bold',
  hip: 'solar:stretching-bold',
  ankle_foot: 'solar:running-2-bold',
  cervical_spine: 'solar:user-speak-rounded-bold',
  elbow_wrist: 'solar:hand-shake-bold',
};

const REGION_LABELS: Record<PhysioBodyRegion, string> = {
  shoulder: 'Shoulder',
  knee: 'Knee',
  lumbar_spine: 'Lumbar spine',
  hip: 'Hip',
  ankle_foot: 'Ankle / foot',
  cervical_spine: 'Cervical spine',
  elbow_wrist: 'Elbow / wrist',
};

function iconFor(region: PhysioBodyRegion) {
  return REGION_ICONS[region] ?? 'solar:health-bold';
}

function labelFor(region: PhysioBodyRegion) {
  return REGION_LABELS[region] ?? region;
}

export default function RegionPickerView() {
  const settings = useSettingsContext();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const { regions, loading } = usePhysioBodyRegions();

  const [startingRegion, setStartingRegion] = useState<PhysioBodyRegion | null>(null);

  const handlePick = useCallback(
    async (region: PhysioBodyRegion) => {
      setStartingRegion(region);
      try {
        const { attemptId } = await startPhysioAttempt(region);
        router.push(paths.dashboard.physioSimulation.attempt(attemptId));
      } catch (error) {
        enqueueSnackbar(error instanceof Error ? error.message : 'Failed to start case', {
          variant: 'error',
        });
        setStartingRegion(null);
      }
    },
    [router, enqueueSnackbar]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Start a new physiotherapy case</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Pick a body region. You&apos;ll be randomly assigned a patient with a problem in that area -- take a
        subjective history, form your hypotheses, examine the patient, then submit your clinical impression.
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
          {regions.map((region) => (
            <Card key={region}>
              <CardActionArea
                disabled={startingRegion !== null}
                onClick={() => handlePick(region)}
                sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              >
                {startingRegion === region ? (
                  <CircularProgress size={40} />
                ) : (
                  <Iconify icon={iconFor(region)} width={40} sx={{ color: 'primary.main' }} />
                )}

                <Typography variant="h6">{labelFor(region)}</Typography>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
