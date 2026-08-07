import { useState, useEffect, useCallback } from 'react';
// lib
import { fetchPhysioAttempts } from 'src/lib/supabase/queries/physio-simulation';
// types
import type { IPhysioAttempt } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------

export function usePhysioAttemptsHistory() {
  const [attempts, setAttempts] = useState<IPhysioAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPhysioAttempts();
      setAttempts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { attempts, loading, error, refresh };
}
