import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// types
import type { UserRole } from 'src/auth/types';
import type { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
// components
import Iconify from 'src/components/iconify';
//
import { ROLE_OPTIONS } from './constants';

// ----------------------------------------------------------------------

type Props = {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  showRoleFilter?: boolean;
};

export default function UserTableToolbar({ filters, onFilters, showRoleFilter = true }: Props) {
  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<UserRole[]>) => {
      const { value } = event.target;
      onFilters('role', typeof value === 'string' ? (value.split(',') as UserRole[]) : value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        alignItems: { xs: 'flex-end', md: 'center' },
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      {showRoleFilter && (
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Role</InputLabel>

          <Select
            multiple
            value={filters.role}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Role" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: { maxHeight: 240 },
                },
              },
            }}
          >
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.role.includes(option.value)}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        fullWidth
        value={filters.name}
        onChange={handleFilterName}
        placeholder="Search by name or email..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  );
}
