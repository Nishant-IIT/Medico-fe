// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { RegionPickerView } from 'src/sections/physio-simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: New physio case',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <RegionPickerView />
    </RoleBasedGuard>
  );
}
