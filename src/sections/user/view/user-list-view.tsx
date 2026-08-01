'use client';

import { useMemo, useState, useCallback } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// types
import type { UserRole } from 'src/auth/types';
import type { IUserProfile } from 'src/types/user';
// components
import Label from 'src/components/label';
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
  { id: 'role', label: 'Role', width: 140 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'createdAt', label: 'Created', width: 140 },
  { id: '', width: 68 },
];

type RoleTab = 'all' | UserRole;

const ROLE_TABS: { value: RoleTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
];

export default function UserListView() {
  const table = useTable({ defaultOrderBy: 'fullName' });

  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const { profiles, loading, mutateOne } = useProfiles();

  const [roleTab, setRoleTab] = useState<RoleTab>('all');

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

  const handleRoleTab = useCallback(
    (_event: React.SyntheticEvent, newValue: RoleTab) => {
      table.onResetPage();
      setRoleTab(newValue);
    },
    [table]
  );

  const dataFiltered = useMemo(() => {
    let data = [...profiles];

    if (roleTab !== 'all') {
      data = data.filter((row) => row.role === roleTab);
    }

    if (name) {
      const query = name.toLowerCase();
      data = data.filter(
        (row) =>
          row.fullName.toLowerCase().includes(query) || row.email.toLowerCase().includes(query)
      );
    }

    const comparator = getComparator(table.order, table.orderBy as keyof IUserProfile);
    return data.sort((a, b) => comparator(a as any, b as any));
  }, [profiles, roleTab, name, table.order, table.orderBy]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !dataFiltered.length;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Users</Typography>

      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 5 }}>
        Welcome back, {user?.displayName}. Manage every account and role from here.
      </Typography>

      <Card>
        <Tabs
          value={roleTab}
          onChange={handleRoleTab}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {ROLE_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={tab.value === 'all' || tab.value === roleTab ? 'filled' : 'soft'}
                  color="default"
                >
                  {tab.value === 'all'
                    ? profiles.length
                    : profiles.filter((row) => row.role === tab.value).length}
                </Label>
              }
            />
          ))}
        </Tabs>

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
                      <UserTableRow key={row.id} row={row} variant="admin" onUpdated={mutateOne} />
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
