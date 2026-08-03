'use client';

import { useMemo, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// types
import type { ScenarioStatus } from 'src/types/scenario';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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
import ScenarioTableRow from '../scenario-table-row';
import { useScenarios } from '../hooks/use-scenarios';
import ScenarioFormDialog from '../scenario-form-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'personaName', label: 'Case' },
  { id: 'bodyPart', label: 'Body part', width: 140 },
  { id: 'status', label: 'Status', width: 160 },
  { id: 'updatedAt', label: 'Updated', width: 140 },
  { id: '', width: 160 },
];

type StatusTab = 'all' | ScenarioStatus;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

type Props = {
  variant: 'teacher' | 'admin';
};

export default function ScenarioListView({ variant }: Props) {
  const table = useTable({ defaultOrderBy: 'updatedAt', defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const { scenarios, loading, upsertOne, removeOne } = useScenarios();

  const createDialog = useBoolean();

  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  const dataFiltered = useMemo(
    () => (statusTab === 'all' ? scenarios : scenarios.filter((s) => s.status === statusTab)),
    [scenarios, statusTab]
  );

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !dataFiltered.length;

  const isTeacher = variant === 'teacher';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack direction="row" sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">{isTeacher ? 'My cases' : 'Case management'}</Typography>

        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={createDialog.onTrue}>
          New case
        </Button>
      </Stack>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        {isTeacher
          ? 'Create patient cases and submit them for admin approval before students can be assigned them.'
          : 'Review, approve, or reject cases submitted by teachers. Approved cases become available to students.'}
      </Typography>

      <Card>
        <Tabs
          value={statusTab}
          onChange={(_event, value: StatusTab) => {
            table.onResetPage();
            setStatusTab(value);
          }}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label variant={tab.value === 'all' || tab.value === statusTab ? 'filled' : 'soft'} color="default">
                  {tab.value === 'all' ? scenarios.length : scenarios.filter((s) => s.status === tab.value).length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {loading
                  ? [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                  : dataInPage.map((row) => (
                      <ScenarioTableRow
                        key={row.id}
                        row={row}
                        variant={variant}
                        onUpdated={upsertOne}
                        onDeleted={removeOne}
                      />
                    ))}

                <TableEmptyRows
                  height={72}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={!loading && notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ScenarioFormDialog open={createDialog.value} onClose={createDialog.onFalse} onSaved={upsertOne} />
    </Container>
  );
}
