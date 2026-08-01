// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import AdminView from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Admin',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['admin']}>
      <AdminView />
    </RoleBasedGuard>
  );
}
