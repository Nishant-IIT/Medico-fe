import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// lib
import { createClient } from 'src/lib/supabase/client';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// types
import type { UserRole } from 'src/auth/types';
import type { IUserProfile, ProfileStatus } from 'src/types/user';
// lib
import { updateUserRole, updateProfileDetails } from 'src/lib/supabase/queries/profiles';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
//
import { ROLE_OPTIONS, STATUS_OPTIONS } from './constants';

// ----------------------------------------------------------------------

type FormValuesProps = {
  role: UserRole;
  status: ProfileStatus;
  department: string;
  subjects: string;
  studentId: string;
  grade: string;
  enrollmentDate: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser: IUserProfile;
  onUpdated: (updated: IUserProfile) => void;
};

const EditUserSchema: Yup.ObjectSchema<FormValuesProps> = Yup.object({
  role: Yup.mixed<UserRole>()
    .oneOf(ROLE_OPTIONS.map((option) => option.value))
    .required('Role is required'),
  status: Yup.mixed<ProfileStatus>()
    .oneOf(STATUS_OPTIONS.map((option) => option.value))
    .required('Status is required'),
  department: Yup.string().defined(),
  subjects: Yup.string().defined(),
  studentId: Yup.string().defined(),
  grade: Yup.string().defined(),
  enrollmentDate: Yup.string().defined(),
});

export default function UserQuickEditForm({ open, onClose, currentUser, onUpdated }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const supabase = useMemo(() => createClient(), []);

  const defaultValues = useMemo<FormValuesProps>(
    () => ({
      role: currentUser.role,
      status: currentUser.status,
      department: currentUser.department || '',
      subjects: currentUser.subjects?.join(', ') || '',
      studentId: currentUser.studentId || '',
      grade: currentUser.grade || '',
      enrollmentDate: currentUser.enrollmentDate || '',
    }),
    [currentUser]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(EditUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const selectedRole = watch('role');

  // useForm only applies defaultValues on mount; this dialog stays mounted
  // between opens (only `open` toggles), so re-sync whenever it's reopened
  // -- otherwise a row edited once and reopened shows stale values.
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.role !== currentUser.role) {
        await updateUserRole(supabase, currentUser.id, data.role);
      }

      const updated = await updateProfileDetails(supabase, currentUser.id, {
        department: data.department || null,
        subjects: data.subjects
          ? data.subjects
              .split(',')
              .map((item: string) => item.trim())
              .filter(Boolean)
          : null,
        studentId: data.studentId || null,
        grade: data.grade || null,
        enrollmentDate: data.enrollmentDate || null,
        status: data.status,
      });

      onUpdated(updated);
      reset();
      onClose();
      enqueueSnackbar('User updated!');
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Update failed', {
        variant: 'error',
      });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { maxWidth: 560 } } }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Typography variant="subtitle2">{currentUser.fullName}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {currentUser.email}
          </Typography>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              },
            }}
          >
            <RHFSelect name="role" label="Role">
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="status" label="Status">
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            {selectedRole === 'teacher' && (
              <>
                <RHFTextField name="department" label="Department" />
                <RHFTextField
                  name="subjects"
                  label="Subjects"
                  helperText="Comma separated, e.g. Biology, Chemistry"
                />
              </>
            )}

            {selectedRole === 'student' && (
              <>
                <RHFTextField name="studentId" label="Student ID" />
                <RHFTextField name="grade" label="Grade" />
                <RHFTextField
                  name="enrollmentDate"
                  label="Enrollment Date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting}>
            Update
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
