'use client';

import { useMemo, useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// types
import type { IUserProfile } from 'src/types/user';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import UserTableRow from '../user-table-row';
import { useProfiles } from '../hooks/use-profiles';
import UserTableToolbar from '../user-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fullName', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone Number', width: 160 },
  { id: 'grade', label: 'Grade', width: 100 },
  { id: 'studentId', label: 'Student ID', width: 140 },
  { id: 'enrollmentDate', label: 'Enrollment Date', width: 160 },
  { id: 'createdAt', label: 'Created', width: 140 },
];

export default function StudentListView() {
  const table = useTable({ defaultOrderBy: 'fullName' });

  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const { profiles, loading, mutateOne } = useProfiles();

  const [name, setName] = useState('');

  const handleFilterName = useCallback(
    (filterName: string, value: unknown) => {
      if (filterName === 'name') {
        table.onResetPage();
        setName(value as string);
      }
    },
    [table]
  );

  const students = useMemo(() => profiles.filter((row) => row.role === 'student'), [profiles]);

  const dataFiltered = useMemo(() => {
    let data = [...students];

    if (name) {
      const query = name.toLowerCase();
      data = data.filter(
        (row) =>
          row.fullName.toLowerCase().includes(query) || row.email.toLowerCase().includes(query)
      );
    }

    const comparator = getComparator(table.order, table.orderBy as keyof IUserProfile);
    return data.sort((a, b) => comparator(a as any, b as any));
  }, [students, name, table.order, table.orderBy]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !dataFiltered.length;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Students</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Welcome back, {user?.displayName}. Here are all of your students.
      </Typography>

      <Card>
        <UserTableToolbar
          filters={{ name, role: [] }}
          onFilters={handleFilterName}
          showRoleFilter={false}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                onSort={table.onSort}
              />

              <TableBody>
                {loading
                  ? [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                  : dataInPage.map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        variant="student"
                        onUpdated={mutateOne}
                      />
                    ))}

                <TableEmptyRows
                  height={table.dense ? 52 : 72}
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
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
