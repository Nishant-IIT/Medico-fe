// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { StudentListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Students',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['teacher']}>
      <StudentListView />
    </RoleBasedGuard>
  );
}
