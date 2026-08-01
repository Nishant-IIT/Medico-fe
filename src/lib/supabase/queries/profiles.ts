import type { SupabaseClient } from '@supabase/supabase-js';
// types
import type { UserRole } from 'src/auth/types';
import type { IUserProfile, ProfileStatus } from 'src/types/user';
// auth
import { mapAppRole } from 'src/auth/context/jwt/utils';

// ----------------------------------------------------------------------

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  status: ProfileStatus;
  phone_number: string | null;
  department: string | null;
  subjects: string[] | null;
  student_id: string | null;
  grade: string | null;
  enrollment_date: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfileRow(row: ProfileRow): IUserProfile {
  return {
    id: row.id,
    email: row.email ?? '',
    fullName: row.full_name ?? row.email ?? '',
    role: mapAppRole(row.role.toUpperCase()),
    status: row.status,
    phoneNumber: row.phone_number,
    department: row.department,
    subjects: row.subjects,
    studentId: row.student_id,
    grade: row.grade,
    enrollmentDate: row.enrollment_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * RLS alone determines which rows come back: admins see every profile,
 * teachers see themselves plus every STUDENT row, students see only
 * themselves (see profiles_select in Medico-be's auth_rbac_profiles.sql).
 */
export async function fetchProfiles(supabase: SupabaseClient): Promise<IUserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, role, status, phone_number, department, subjects, student_id, grade, enrollment_date, created_at, updated_at'
    )
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data as ProfileRow[]).map(mapProfileRow);
}

export async function updateUserRole(
  supabase: SupabaseClient,
  targetUserId: string,
  role: UserRole
): Promise<IUserProfile> {
  const { data, error } = await supabase
    .rpc('admin_set_user_role', {
      target_user_id: targetUserId,
      new_role: role.toUpperCase(),
    })
    .single();

  if (error) throw new Error(error.message);

  return mapProfileRow(data as ProfileRow);
}

export type ProfileDetailsPatch = {
  department: string | null;
  subjects: string[] | null;
  studentId: string | null;
  grade: string | null;
  enrollmentDate: string | null;
  status: ProfileStatus;
};

export async function updateProfileDetails(
  supabase: SupabaseClient,
  targetUserId: string,
  patch: ProfileDetailsPatch
): Promise<IUserProfile> {
  const { data, error } = await supabase
    .rpc('admin_update_profile_details', {
      target_user_id: targetUserId,
      new_department: patch.department,
      new_subjects: patch.subjects,
      new_student_id: patch.studentId,
      new_grade: patch.grade,
      new_enrollment_date: patch.enrollmentDate,
      new_status: patch.status,
    })
    .single();

  if (error) throw new Error(error.message);

  return mapProfileRow(data as ProfileRow);
}
