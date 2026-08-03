import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// lib
import { createClient } from 'src/lib/supabase/client';
import { rejectScenario } from 'src/lib/supabase/queries/scenarios';
// types
import type { IScenario } from 'src/types/scenario';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  reason: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  scenario: IScenario;
  onRejected: (scenario: IScenario) => void;
};

const RejectSchema: Yup.ObjectSchema<FormValuesProps> = Yup.object({
  reason: Yup.string().trim().required('Tell the teacher why this is being rejected'),
});

export default function RejectScenarioDialog({ open, onClose, scenario, onRejected }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const supabase = useMemo(() => createClient(), []);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RejectSchema),
    defaultValues: { reason: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updated = await rejectScenario(supabase, scenario.id, data.reason);
      onRejected(updated);
      onClose();
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Reject failed', { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Reject &ldquo;{scenario.personaName}&rdquo;</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            The teacher will see this reason and can edit the case before resubmitting it.
          </Typography>

          <RHFTextField name="reason" label="Reason" multiline rows={3} />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" color="error" loading={isSubmitting}>
            Reject
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
