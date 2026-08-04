// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { ScenarioListView } from 'src/sections/scenarios/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: My cases',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['teacher']}>
      <ScenarioListView variant="teacher" />
    </RoleBasedGuard>
  );
}
