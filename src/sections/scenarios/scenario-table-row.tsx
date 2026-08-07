// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
// lib
import { createClient } from 'src/lib/supabase/client';
import { deleteScenario, approveScenario, submitScenarioForApproval } from 'src/lib/supabase/queries/scenarios';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fDate } from 'src/utils/format-time';
// types
import type { IScenario } from 'src/types/scenario';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
//
import ScenarioStatusLabel from './scenario-status-label';
import ScenarioFormDialog from './scenario-form-dialog';
import RejectScenarioDialog from './reject-scenario-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: IScenario;
  variant: 'teacher' | 'admin';
  onUpdated: (updated: IScenario) => void;
  onDeleted: (scenarioId: string) => void;
};

export default function ScenarioTableRow({ row, variant, onUpdated, onDeleted }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const supabase = createClient();

  const formDialog = useBoolean();
  const rejectDialog = useBoolean();
  const deleteDialog = useBoolean();
  const submitting = useBoolean();

  const isAdmin = variant === 'admin';

  const canEdit = isAdmin || row.status === 'draft' || row.status === 'rejected';
  const canSubmit = !isAdmin && (row.status === 'draft' || row.status === 'rejected');
  const canApprove = isAdmin && (row.status === 'draft' || row.status === 'pending_approval');
  const canReject = isAdmin && row.status === 'pending_approval';

  const handleSubmitForApproval = async () => {
    submitting.onTrue();
    try {
      const updated = await submitScenarioForApproval(supabase, row.id);
      onUpdated(updated);
      enqueueSnackbar('Submitted for approval!');
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Submit failed', { variant: 'error' });
    } finally {
      submitting.onFalse();
    }
  };

  const handleApprove = async () => {
    submitting.onTrue();
    try {
      const updated = await approveScenario(supabase, row.id);
      onUpdated(updated);
      enqueueSnackbar('Approved -- now visible to students.');
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Approve failed', { variant: 'error' });
    } finally {
      submitting.onFalse();
    }
  };

  const handleDelete = async () => {
    submitting.onTrue();
    try {
      await deleteScenario(supabase, row.id);
      onDeleted(row.id);
      enqueueSnackbar('Scenario deleted.');
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Delete failed', { variant: 'error' });
    } finally {
      submitting.onFalse();
      deleteDialog.onFalse();
    }
  };

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={formDialog.onTrue}>
        <TableCell>
          <ListItemText
            primary={row.personaName}
            secondary={row.problemCode}
            slotProps={{
              primary: { sx: { typography: 'body2' } },
              secondary: { sx: { color: 'text.disabled' } },
            }}
          />
        </TableCell>

        <TableCell sx={{ textTransform: 'capitalize' }}>{row.bodyPart}</TableCell>

        <TableCell>
          {row.status === 'rejected' && row.rejectionReason ? (
            <Tooltip title={row.rejectionReason} placement="top" arrow>
              <span>
                <ScenarioStatusLabel status={row.status} />
              </span>
            </Tooltip>
          ) : (
            <ScenarioStatusLabel status={row.status} />
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.updatedAt)}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }} onClick={(event) => event.stopPropagation()}>
          {submitting.value ? (
            <CircularProgress size={20} sx={{ mx: 1.5 }} />
          ) : (
            <>
              {canEdit && (
                <Tooltip title="Edit" placement="top" arrow>
                  <IconButton onClick={formDialog.onTrue}>
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                </Tooltip>
              )}

              {canSubmit && (
                <Tooltip title="Submit for approval" placement="top" arrow>
                  <IconButton color="warning" onClick={handleSubmitForApproval}>
                    <Iconify icon="solar:upload-bold" />
                  </IconButton>
                </Tooltip>
              )}

              {canApprove && (
                <Tooltip title="Approve" placement="top" arrow>
                  <IconButton color="success" onClick={handleApprove}>
                    <Iconify icon="solar:check-circle-bold" />
                  </IconButton>
                </Tooltip>
              )}

              {canReject && (
                <Tooltip title="Reject" placement="top" arrow>
                  <IconButton color="error" onClick={rejectDialog.onTrue}>
                    <Iconify icon="solar:close-circle-bold" />
                  </IconButton>
                </Tooltip>
              )}

              {isAdmin && (
                <Tooltip title="Delete" placement="top" arrow>
                  <IconButton color="error" onClick={deleteDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </TableCell>
      </TableRow>

      <ScenarioFormDialog
        open={formDialog.value}
        onClose={formDialog.onFalse}
        scenario={row}
        onSaved={onUpdated}
        readOnly={!canEdit}
      />

      {canReject && (
        <RejectScenarioDialog
          open={rejectDialog.value}
          onClose={rejectDialog.onFalse}
          scenario={row}
          onRejected={onUpdated}
        />
      )}

      {isAdmin && (
        <Dialog open={deleteDialog.value} onClose={deleteDialog.onFalse} maxWidth="xs" fullWidth>
          <DialogTitle>Delete case</DialogTitle>
          <DialogContent>
            Delete &ldquo;{row.personaName}&rdquo; ({row.problemCode})? This can&apos;t be undone.
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={deleteDialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} loading={submitting.value}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
