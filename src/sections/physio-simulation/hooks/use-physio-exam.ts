import { useState, useEffect, useCallback } from 'react';
// lib
import {
  fetchPhysioTestBank,
  performSpecialTest,
  fetchPhysioAttemptPerformedTests,
} from 'src/lib/supabase/queries/physio-simulation';
// types
import type { IAvailableTest, IPerformedTest } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------

export function usePhysioExam(attemptId: string) {
  const [testBank, setTestBank] = useState<IAvailableTest[]>([]);
  const [performedTests, setPerformedTests] = useState<IPerformedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [performingTestId, setPerformingTestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPhysioTestBank(attemptId), fetchPhysioAttemptPerformedTests(attemptId)])
      .then(([bank, performed]) => {
        setTestBank(bank);
        setPerformedTests(performed);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load exam'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const perform = useCallback(
    async (testId: string) => {
      setPerformingTestId(testId);
      setError(null);
      try {
        const finding = await performSpecialTest(attemptId, testId);
        setPerformedTests((prev) => (prev.some((t) => t.id === finding.id) ? prev : [...prev, finding]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to perform test');
      } finally {
        setPerformingTestId(null);
      }
    },
    [attemptId]
  );

  return { testBank, performedTests, loading, performingTestId, error, perform };
}
