// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// types
import type { IPhysioAttempt } from 'src/types/physio-simulation';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  attempt: IPhysioAttempt;
  starting?: boolean;
  onStart: VoidFunction;
  onBack: VoidFunction;
};

export default function CaseIntroCard({ attempt, starting, onStart, onBack }: Props) {
  return (
    <Card sx={{ p: 5, textAlign: 'center' }}>
      <Iconify icon="solar:user-speak-rounded-bold" width={48} sx={{ color: 'primary.main', mb: 2 }} />

      <Typography variant="h5" sx={{ mb: 1 }}>
        {attempt.personaName}
      </Typography>

      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', mb: 4 }}>
        {attempt.presentingComplaint}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Take a subjective history, form your working hypotheses, examine the patient, then submit your
        clinical impression. The timer starts as soon as you begin.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
        <Button variant="outlined" size="large" disabled={starting} onClick={onBack}>
          Back to main menu
        </Button>

        <Button
          variant="contained"
          size="large"
          loading={starting}
          onClick={onStart}
          startIcon={<Iconify icon="solar:play-bold" />}
        >
          Start
        </Button>
      </Stack>
    </Card>
  );
}
