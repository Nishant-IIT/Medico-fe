// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { AttemptReportView } from 'src/sections/simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Case report',
};

type Props = {
  params: Promise<{ attemptId: string }>;
};

export default async function Page({ params }: Props) {
  const { attemptId } = await params;

  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <AttemptReportView attemptId={attemptId} />
    </RoleBasedGuard>
  );
}
