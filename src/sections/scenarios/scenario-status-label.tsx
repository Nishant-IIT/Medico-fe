// types
import type { ScenarioStatus } from 'src/types/scenario';
// components
import Label from 'src/components/label';
import type { LabelColor } from 'src/components/label/types';

// ----------------------------------------------------------------------

const STATUS_COLOR: Record<ScenarioStatus, LabelColor> = {
  draft: 'default',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'error',
};

const STATUS_TEXT: Record<ScenarioStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

type Props = {
  status: ScenarioStatus;
};

export default function ScenarioStatusLabel({ status }: Props) {
  return (
    <Label variant="soft" color={STATUS_COLOR[status]}>
      {STATUS_TEXT[status]}
    </Label>
  );
}
