// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { BodyPartPickerView } from 'src/sections/simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: New case',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <BodyPartPickerView />
    </RoleBasedGuard>
  );
}
