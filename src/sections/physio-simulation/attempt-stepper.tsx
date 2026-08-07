// @mui
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
// types
import type { PhysioAttemptPhase } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------

const STEPS: { phase: PhysioAttemptPhase; label: string }[] = [
  { phase: 'subjective', label: 'Subjective' },
  { phase: 'hypotheses', label: 'Hypotheses' },
  { phase: 'exam', label: 'Exam' },
  { phase: 'diagnosis', label: 'Diagnosis' },
];

/** Phases unlock in order; 'submitted' means every step is complete. */
function stepIndexForPhase(phase: PhysioAttemptPhase): number {
  if (phase === 'submitted') return STEPS.length;
  return STEPS.findIndex((step) => step.phase === phase);
}

type Props = {
  phase: PhysioAttemptPhase;
};

export default function AttemptStepper({ phase }: Props) {
  const activeStep = stepIndexForPhase(phase);

  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
      {STEPS.map((step) => (
        <Step key={step.phase}>
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
