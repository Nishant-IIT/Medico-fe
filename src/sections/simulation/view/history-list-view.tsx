'use client';

import { useMemo, useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchReportScores } from 'src/lib/supabase/queries/simulation';
// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { fDateTime } from 'src/utils/format-time';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import { useAttemptsHistory } from '../hooks/use-attempts-history';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'personaName', label: 'Case' },
  { id: 'bodyPart', label: 'Body part', width: 140 },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'score', label: 'Score', width: 100 },
  { id: 'startedAt', label: 'Started', width: 180 },
];

export default function HistoryListView() {
  const table = useTable({ defaultOrderBy: 'startedAt', defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const { attempts, loading } = useAttemptsHistory();

  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchReportScores(supabase).then(setScores).catch(() => {});
  }, [supabase]);

  const dataInPage = attempts.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !attempts.length;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">My history</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Every case you&apos;ve attempted, with your score once submitted. Click a row to review it.
      </Typography>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {loading
                  ? [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                  : dataInPage.map((attempt) => (
                      <TableRow
                        key={attempt.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() =>
                          router.push(
                            attempt.status === 'submitted'
                              ? paths.dashboard.history.attempt(attempt.id)
                              : paths.dashboard.simulation.attempt(attempt.id)
                          )
                        }
                      >
                        <TableCell>{attempt.personaName}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{attempt.bodyPart}</TableCell>
                        <TableCell>
                          <Label variant="soft" color={attempt.status === 'submitted' ? 'success' : 'warning'}>
                            {attempt.status === 'submitted' ? 'Submitted' : 'In progress'}
                          </Label>
                        </TableCell>
                        <TableCell>{scores[attempt.id] != null ? `${scores[attempt.id]}` : '—'}</TableCell>
                        <TableCell>{fDateTime(attempt.startedAt)}</TableCell>
                      </TableRow>
                    ))}

                <TableEmptyRows
                  height={72}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, attempts.length)}
                />

                <TableNoData notFound={!loading && notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={attempts.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
