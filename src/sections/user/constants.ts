import type { UserRole } from 'src/auth/types';
import type { ProfileStatus } from 'src/types/user';

// ----------------------------------------------------------------------

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
];

export const STATUS_OPTIONS: { value: ProfileStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
