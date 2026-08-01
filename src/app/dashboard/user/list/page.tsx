// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Users',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['admin']}>
      <UserListView />
    </RoleBasedGuard>
  );
}
