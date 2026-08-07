// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// types
import type { IPerformedTest, TestFindingResult } from 'src/types/physio-simulation';
// components
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const CATEGORY_LABEL: Record<IPerformedTest['category'], string> = {
  special_test: 'Special test',
  rom: 'ROM',
  palpation: 'Palpation',
};

const RESULT_COLOR: Record<TestFindingResult, 'error' | 'success' | 'default'> = {
  positive: 'error',
  negative: 'success',
  inconclusive: 'default',
};

const RESULT_LABEL: Record<TestFindingResult, string> = {
  positive: 'Positive',
  negative: 'Negative',
  inconclusive: 'Inconclusive',
};

type Props = {
  finding: IPerformedTest;
};

export default function ExamFindingCard({ finding }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, mb: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="subtitle2">{finding.testName}</Typography>
        <Label variant="soft" color={RESULT_COLOR[finding.result]}>
          {RESULT_LABEL[finding.result]}
        </Label>
      </Stack>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {CATEGORY_LABEL[finding.category]}
      </Typography>

      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {finding.resultDetail}
      </Typography>

      {(finding.romDegrees != null || finding.painResponse) && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {finding.romDegrees != null && (
            <Chip size="small" variant="soft" label={`${finding.romDegrees}°`} />
          )}
          {finding.painResponse && (
            <Chip size="small" variant="soft" label={`Pain: ${finding.painResponse}`} />
          )}
        </Stack>
      )}
    </Paper>
  );
}
