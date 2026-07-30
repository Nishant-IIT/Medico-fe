// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import TeacherView from 'src/sections/teacher/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Teacher',
};

export default function Page() {
  return (
    <RoleBasedGuard hasContent roles={['teacher']}>
      <TeacherView />
    </RoleBasedGuard>
  );
}
