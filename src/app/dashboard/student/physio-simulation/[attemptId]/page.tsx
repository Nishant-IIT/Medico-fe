// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { PhysioAttemptView } from 'src/sections/physio-simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Physio case',
};

type Props = {
  params: Promise<{ attemptId: string }>;
};

export default async function Page({ params }: Props) {
  const { attemptId } = await params;

  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <PhysioAttemptView attemptId={attemptId} />
    </RoleBasedGuard>
  );
}
