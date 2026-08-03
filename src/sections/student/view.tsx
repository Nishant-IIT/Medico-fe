'use client';

// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
// auth
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function StudentView() {
  const settings = useSettingsContext();

  const { user } = useAuthContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Student dashboard</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Welcome back, {user?.displayName}. Practice taking a patient history and get scored feedback.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardActionArea
            component={RouterLink}
            href={paths.dashboard.simulation.root}
            sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}
          >
            <Iconify icon="solar:chat-round-dots-bold" width={32} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Start a new case</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Pick a body part and talk to a randomly assigned simulated patient.
            </Typography>
          </CardActionArea>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardActionArea
            component={RouterLink}
            href={paths.dashboard.history.root}
            sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}
          >
            <Iconify icon="solar:folder-bold" width={32} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">My history</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Review past cases, your scores, and where you can improve.
            </Typography>
          </CardActionArea>
        </Card>
      </Stack>

      <Button
        component={RouterLink}
        href={paths.dashboard.simulation.root}
        variant="contained"
        size="large"
        sx={{ mt: 3, display: { xs: 'flex', sm: 'none' } }}
        fullWidth
      >
        Start a new case
      </Button>
    </Container>
  );
}
