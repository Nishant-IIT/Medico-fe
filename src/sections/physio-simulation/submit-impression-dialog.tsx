import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// lib
import { submitPhysioAttempt } from 'src/lib/supabase/queries/physio-simulation';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// types
import type { IPhysioReport } from 'src/types/physio-simulation';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  diagnosisText: string;
  reasoningText: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  attemptId: string;
  onSubmitted: (report: IPhysioReport) => void;
};

const SubmitImpressionSchema: Yup.ObjectSchema<FormValuesProps> = Yup.object({
  diagnosisText: Yup.string().trim().required('Enter your clinical impression'),
  reasoningText: Yup.string().trim().required('Explain your clinical reasoning'),
});

export default function SubmitImpressionDialog({ open, onClose, attemptId, onSubmitted }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(SubmitImpressionSchema),
    defaultValues: { diagnosisText: '', reasoningText: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const report = await submitPhysioAttempt(attemptId, data.diagnosisText, data.reasoningText);
      onSubmitted(report);
      onClose();
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Submission failed', { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Submit your clinical impression</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            This ends the encounter and generates your scored report. You won&apos;t be able to ask more
            questions or perform more tests after submitting.
          </Typography>

          <RHFTextField name="diagnosisText" label="Diagnosis / clinical impression" sx={{ mb: 3 }} />

          <RHFTextField
            name="reasoningText"
            label="Clinical reasoning"
            multiline
            rows={4}
            helperText="Why do you think this is the diagnosis? Which findings support it?"
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting}>
            Submit
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
