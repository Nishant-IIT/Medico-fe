import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// lib
import { createClient } from 'src/lib/supabase/client';
import { createScenario, updateScenario } from 'src/lib/supabase/queries/scenarios';
// types
import type { IScenario } from 'src/types/scenario';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
//
import { useKnownBodyParts } from './hooks/use-known-body-parts';

// ----------------------------------------------------------------------

type FormValuesProps = {
  bodyPart: string;
  problemCode: string;
  personaName: string;
  personaSystemPrompt: string;
  presentingComplaint: string;
  correctDiagnosis: string;
  keyQuestions: string;
  redFlags: string;
  differentials: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  scenario?: IScenario;
  onSaved: (scenario: IScenario) => void;
  readOnly?: boolean;
};

const ScenarioSchema: Yup.ObjectSchema<FormValuesProps> = Yup.object({
  bodyPart: Yup.string().trim().required('Body part is required'),
  problemCode: Yup.string().trim().required('Problem code is required'),
  personaName: Yup.string().trim().required('Patient name is required'),
  personaSystemPrompt: Yup.string().trim().required('Persona instructions are required'),
  presentingComplaint: Yup.string().trim().required('Presenting complaint is required'),
  correctDiagnosis: Yup.string().trim().required('Correct diagnosis is required'),
  keyQuestions: Yup.string().trim().required('List at least one key question'),
  redFlags: Yup.string().trim().required('List at least one red flag'),
  differentials: Yup.string().trim().required('List at least one differential'),
});

function toCommaList(value: string[]) {
  return value.join(', ');
}

function fromCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const EMPTY_VALUES: FormValuesProps = {
  bodyPart: '',
  problemCode: '',
  personaName: '',
  personaSystemPrompt: '',
  presentingComplaint: '',
  correctDiagnosis: '',
  keyQuestions: '',
  redFlags: '',
  differentials: '',
};

export default function ScenarioFormDialog({ open, onClose, scenario, onSaved, readOnly }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const supabase = useMemo(() => createClient(), []);

  const knownBodyParts = useKnownBodyParts();

  const isEdit = !!scenario;

  let dialogTitle = 'New case';
  if (readOnly) dialogTitle = 'View case';
  else if (isEdit) dialogTitle = 'Edit case';

  const defaultValues = useMemo<FormValuesProps>(
    () =>
      scenario
        ? {
            bodyPart: scenario.bodyPart,
            problemCode: scenario.problemCode,
            personaName: scenario.personaName,
            personaSystemPrompt: scenario.personaSystemPrompt,
            presentingComplaint: scenario.presentingComplaint,
            correctDiagnosis: scenario.correctDiagnosis,
            keyQuestions: toCommaList(scenario.rubric.keyQuestions),
            redFlags: toCommaList(scenario.rubric.redFlags),
            differentials: toCommaList(scenario.rubric.differentials),
          }
        : EMPTY_VALUES,
    [scenario]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ScenarioSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Dialog stays mounted between opens; re-sync whenever it reopens so
  // switching between "create" and "edit an existing row" doesn't leak
  // stale values from a previous open.
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const values = {
        bodyPart: data.bodyPart,
        problemCode: data.problemCode,
        personaName: data.personaName,
        personaSystemPrompt: data.personaSystemPrompt,
        presentingComplaint: data.presentingComplaint,
        correctDiagnosis: data.correctDiagnosis,
        rubric: {
          keyQuestions: fromCommaList(data.keyQuestions),
          redFlags: fromCommaList(data.redFlags),
          differentials: fromCommaList(data.differentials),
        },
      };

      const saved = isEdit
        ? await updateScenario(supabase, scenario.id, values)
        : await createScenario(supabase, values);

      onSaved(saved);
      onClose();
      enqueueSnackbar(isEdit ? 'Scenario updated!' : 'Scenario created as a draft!');
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Save failed', { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{dialogTitle}</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              mt: 0.5,
            }}
          >
            <RHFTextField
              name="bodyPart"
              label="Body part"
              disabled={readOnly}
              helperText={knownBodyParts.length ? `Existing: ${knownBodyParts.join(', ')}` : undefined}
            />
            <RHFTextField name="problemCode" label="Problem code" disabled={readOnly} helperText="e.g. GI-003" />
            <RHFTextField name="personaName" label="Patient name" disabled={readOnly} />
            <RHFTextField
              name="correctDiagnosis"
              label="Correct diagnosis (answer key)"
              disabled={readOnly}
            />

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <RHFTextField
                name="presentingComplaint"
                label="Presenting complaint (shown to students before they start)"
                disabled={readOnly}
              />
            </Box>

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <RHFTextField
                name="personaSystemPrompt"
                label="Persona instructions"
                multiline
                rows={6}
                disabled={readOnly}
                helperText="Written in second person to the AI ('You are ..., a NN-year-old ...'). Describe the patient's story, personality, and exactly what to reveal only if asked. Remind it never to state the diagnosis or use clinical jargon."
              />
            </Box>

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <RHFTextField
                name="keyQuestions"
                label="Key questions (comma separated)"
                multiline
                rows={2}
                disabled={readOnly}
                helperText="Questions a good history should cover -- used to score history-taking."
              />
            </Box>

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <RHFTextField
                name="redFlags"
                label="Red flags (comma separated)"
                multiline
                rows={2}
                disabled={readOnly}
                helperText="Dangerous findings the student should identify or ask about."
              />
            </Box>

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <RHFTextField
                name="differentials"
                label="Differential diagnoses (comma separated)"
                multiline
                rows={2}
                disabled={readOnly}
                helperText="Other conditions a good student should consider and rule out."
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>

          {!readOnly && (
            <Button type="submit" variant="contained" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create draft'}
            </Button>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
