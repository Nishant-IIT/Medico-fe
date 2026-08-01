import type { UserRole } from 'src/auth/types';

// ----------------------------------------------------------------------

export type ProfileStatus = 'active' | 'inactive';

export type IUserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: ProfileStatus;
  phoneNumber: string | null;
  department: string | null;
  subjects: string[] | null;
  studentId: string | null;
  grade: string | null;
  enrollmentDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IUserTableFilters = {
  name: string;
  role: UserRole[];
};

export type IUserTableFilterValue = string | UserRole[];
