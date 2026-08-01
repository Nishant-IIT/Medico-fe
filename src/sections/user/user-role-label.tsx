// types
import type { UserRole } from 'src/auth/types';
// components
import Label from 'src/components/label';
import type { LabelColor } from 'src/components/label/types';

// ----------------------------------------------------------------------

const ROLE_COLOR: Record<UserRole, LabelColor> = {
  admin: 'error',
  teacher: 'info',
  student: 'default',
};

type Props = {
  role: UserRole;
};

export default function UserRoleLabel({ role }: Props) {
  return (
    <Label variant="soft" color={ROLE_COLOR[role]} sx={{ textTransform: 'capitalize' }}>
      {role}
    </Label>
  );
}
