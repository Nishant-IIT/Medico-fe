// @mui
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fDate } from 'src/utils/format-time';
// types
import type { IUserProfile } from 'src/types/user';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
//
import UserRoleLabel from './user-role-label';
import { mockAvatarUrl } from './utils/avatar';
import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  row: IUserProfile;
  variant: 'admin' | 'student';
  onUpdated: (updated: IUserProfile) => void;
};

export default function UserTableRow({ row, variant, onUpdated }: Props) {
  const {
    id,
    fullName,
    email,
    phoneNumber,
    role,
    status,
    createdAt,
    grade,
    studentId,
    enrollmentDate,
  } = row;

  const quickEdit = useBoolean();

  const isAdminView = variant === 'admin';

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={fullName} src={mockAvatarUrl(id)} sx={{ mr: 2 }} />

          <ListItemText
            primary={fullName}
            secondary={email}
            slotProps={{
              primary: { sx: { typography: 'body2' } },
              secondary: { sx: { color: 'text.disabled' } },
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{phoneNumber || '-'}</TableCell>

        {isAdminView ? (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              <UserRoleLabel role={role} />
            </TableCell>

            <TableCell>
              <Label variant="soft" color={status === 'active' ? 'success' : 'default'}>
                {status}
              </Label>
            </TableCell>
          </>
        ) : (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{grade || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{studentId || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(enrollmentDate) || '-'}</TableCell>
          </>
        )}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(createdAt)}</TableCell>

        {isAdminView && (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <Tooltip title="Quick Edit" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          </TableCell>
        )}
      </TableRow>

      {isAdminView && (
        <UserQuickEditForm
          currentUser={row}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
