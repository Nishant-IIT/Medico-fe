'use client';

import { useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
// types
import type { IAvailableTest, SpecialTestCategory } from 'src/types/physio-simulation';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const CATEGORY_TABS: { value: SpecialTestCategory; label: string }[] = [
  { value: 'special_test', label: 'Special tests' },
  { value: 'rom', label: 'Range of motion' },
  { value: 'palpation', label: 'Palpation' },
];

type Props = {
  testBank: IAvailableTest[];
  performedTestIds: string[];
  performingTestId: string | null;
  onPerform: (testId: string) => void;
};

export default function SpecialTestPicker({ testBank, performedTestIds, performingTestId, onPerform }: Props) {
  const [category, setCategory] = useState<SpecialTestCategory>('special_test');

  const performedSet = useMemo(() => new Set(performedTestIds), [performedTestIds]);

  const tabs = CATEGORY_TABS.filter((tab) => testBank.some((test) => test.category === tab.value));

  const testsInCategory = testBank.filter((test) => test.category === category);

  return (
    <Box>
      <Tabs value={category} onChange={(_event, value) => setCategory(value)} sx={{ mb: 2 }}>
        {tabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <Scrollbar sx={{ maxHeight: 480 }}>
        <Stack spacing={1.5} sx={{ pr: 1 }}>
          {testsInCategory.map((test) => {
            const performed = performedSet.has(test.id);
            const performing = performingTestId === test.id;

            return (
              <Stack
                key={test.id}
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">{test.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {test.briefInstruction}
                  </Typography>
                </Box>

                <Button
                  variant={performed ? 'outlined' : 'contained'}
                  color={performed ? 'success' : 'primary'}
                  disabled={performed || performingTestId !== null}
                  onClick={() => onPerform(test.id)}
                  startIcon={
                    performing ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Iconify icon={performed ? 'solar:check-circle-bold' : 'solar:play-bold'} width={18} />
                    )
                  }
                  sx={{ flexShrink: 0 }}
                >
                  {performed ? 'Performed' : 'Perform'}
                </Button>
              </Stack>
            );
          })}
        </Stack>
      </Scrollbar>
    </Box>
  );
}
