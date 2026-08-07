// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { PhysioHistoryListView } from 'src/sections/physio-simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: My physio history',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <PhysioHistoryListView />
    </RoleBasedGuard>
  );
}
