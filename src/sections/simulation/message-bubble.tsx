// @mui
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
// types
import type { IMessage } from 'src/types/simulation';

// ----------------------------------------------------------------------

type Props = {
  message: IMessage;
  personaName: string;
};

export default function MessageBubble({ message, personaName }: Props) {
  const isStudent = message.role === 'student';

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, justifyContent: isStudent ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}
    >
      {!isStudent && (
        <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.dark' }}>
          <Iconify icon="solar:user-rounded-bold" width={22} />
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%' }}>
        {!isStudent && (
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
            {personaName}
          </Typography>
        )}

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isStudent ? 'primary.main' : 'background.neutral',
            color: isStudent ? 'primary.contrastText' : 'text.primary',
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        </Paper>
      </Box>

      {isStudent && (
        <Avatar sx={{ bgcolor: 'grey.700' }}>
          <Iconify icon="solar:stethoscope-bold" width={22} />
        </Avatar>
      )}
    </Stack>
  );
}
