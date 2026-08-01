// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import StudentView from 'src/sections/student/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Student',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <StudentView />
    </RoleBasedGuard>
  );
}
