// auth
import RoleBasedGuard from 'src/auth/guard/role-based-guard';
// sections
import { AttemptChatView } from 'src/sections/simulation/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Case',
};

type Props = {
  params: Promise<{ attemptId: string }>;
};

export default async function Page({ params }: Props) {
  const { attemptId } = await params;

  return (
    <RoleBasedGuard hasContent roles={['student']}>
      <AttemptChatView attemptId={attemptId} />
    </RoleBasedGuard>
  );
}
