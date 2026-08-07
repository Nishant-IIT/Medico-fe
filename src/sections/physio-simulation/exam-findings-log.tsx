// @mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// types
import type { IPerformedTest } from 'src/types/physio-simulation';
// components
import Scrollbar from 'src/components/scrollbar';
//
import ExamFindingCard from './exam-finding-card';

// ----------------------------------------------------------------------

type Props = {
  performedTests: IPerformedTest[];
  maxHeight?: number;
};

export default function ExamFindingsLog({ performedTests, maxHeight = 480 }: Props) {
  if (performedTests.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No tests performed yet -- results will appear here as you examine the patient.
      </Typography>
    );
  }

  return (
    <Scrollbar sx={{ maxHeight }}>
      <Box sx={{ pr: 1 }}>
        {performedTests.map((finding) => (
          <ExamFindingCard key={finding.id} finding={finding} />
        ))}
      </Box>
    </Scrollbar>
  );
}
