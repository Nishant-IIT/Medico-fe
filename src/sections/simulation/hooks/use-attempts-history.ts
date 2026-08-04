import { useMemo, useState, useEffect, useCallback } from 'react';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchAttempts } from 'src/lib/supabase/queries/simulation';
// types
import type { IAttempt } from 'src/types/simulation';

// ----------------------------------------------------------------------

export function useAttemptsHistory() {
  const supabase = useMemo(() => createClient(), []);

  const [attempts, setAttempts] = useState<IAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAttempts(supabase);
      setAttempts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { attempts, loading, error, refresh };
}
