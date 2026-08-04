'use client';

// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

export default function AdminView() {
  const settings = useSettingsContext();

  const { user } = useAuthContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Admin dashboard</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Welcome back, {user?.displayName}. Manage teachers, students, and school-wide settings here.
      </Typography>

      <Card sx={{ maxWidth: 360 }}>
        <CardActionArea
          component={RouterLink}
          href={paths.dashboard.scenarios.admin}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}
        >
          <Iconify icon="solar:folder-bold" width={32} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Case management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Review, approve, or reject cases submitted by teachers.
          </Typography>
        </CardActionArea>
      </Card>

      <Box
        sx={{
          mt: 3,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      />
    </Container>
  );
}
