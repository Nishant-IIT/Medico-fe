import { useState, useEffect, useCallback } from 'react';
// lib
import {
  advanceToExam,
  recordHypotheses,
  fetchPhysioAttemptHypotheses,
} from 'src/lib/supabase/queries/physio-simulation';
// types
import type { IHypothesis, PhysioAttemptPhase } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------

export function usePhysioHypotheses(attemptId: string) {
  const [hypotheses, setHypotheses] = useState<IHypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhysioAttemptHypotheses(attemptId)
      .then(setHypotheses)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load hypotheses'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const persist = useCallback(
    async (texts: string[]) => {
      setSaving(true);
      setError(null);
      try {
        const result = await recordHypotheses(attemptId, texts);
        setHypotheses(result.hypotheses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save hypotheses');
      } finally {
        setSaving(false);
      }
    },
    [attemptId]
  );

  const add = useCallback(
    (text: string) => persist([...hypotheses.map((h) => h.text), text]),
    [hypotheses, persist]
  );

  const remove = useCallback(
    (id: string) => persist(hypotheses.filter((h) => h.id !== id).map((h) => h.text)),
    [hypotheses, persist]
  );

  const edit = useCallback(
    (id: string, text: string) =>
      persist(hypotheses.map((h) => (h.id === id ? text : h.text))),
    [hypotheses, persist]
  );

  const confirmAndAdvance = useCallback(async (): Promise<PhysioAttemptPhase> => {
    setSaving(true);
    setError(null);
    try {
      const { phase } = await advanceToExam(attemptId);
      return phase;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed to exam');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [attemptId]);

  return { hypotheses, loading, saving, error, add, remove, edit, confirmAndAdvance };
}
