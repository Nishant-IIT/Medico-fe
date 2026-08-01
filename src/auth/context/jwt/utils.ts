import { UserRole } from '../../types';

// ----------------------------------------------------------------------

// Mirrors the public.app_role enum in Medico-be's
// supabase/migrations/20260731061432_auth_rbac_profiles.sql. The JWT's
// `user_role` claim (injected by custom_access_token_hook) is always one
// of these three uppercase values; the UI works in lowercase.
const ROLE_CLAIM_MAP: Record<string, UserRole> = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

/** Falls back to 'student' to mirror the hook's own `coalesce(..., 'STUDENT')`. */
export function mapAppRole(claim: unknown): UserRole {
  return ROLE_CLAIM_MAP[claim as string] ?? 'student';
}
