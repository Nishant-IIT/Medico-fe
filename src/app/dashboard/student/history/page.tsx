// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { HistoryListView } from 'src/sections/simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: My history',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <HistoryListView />
    </RoleBasedGuard>
  );
}
