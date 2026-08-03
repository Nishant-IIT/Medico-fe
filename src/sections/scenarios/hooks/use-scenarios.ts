import { useMemo, useState, useEffect, useCallback } from 'react';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchScenarios } from 'src/lib/supabase/queries/scenarios';
// types
import type { IScenario } from 'src/types/scenario';

// ----------------------------------------------------------------------

export function useScenarios() {
  const supabase = useMemo(() => createClient(), []);

  const [scenarios, setScenarios] = useState<IScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScenarios(supabase);
      setScenarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsertOne = useCallback((updated: IScenario) => {
    setScenarios((prev) => {
      const exists = prev.some((s) => s.id === updated.id);
      return exists ? prev.map((s) => (s.id === updated.id ? updated : s)) : [updated, ...prev];
    });
  }, []);

  const removeOne = useCallback((scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
  }, []);

  return { supabase, scenarios, loading, error, refresh, upsertOne, removeOne };
}
