import { useMemo, useState, useEffect } from 'react';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchScenarioBodyParts } from 'src/lib/supabase/queries/simulation';

// ----------------------------------------------------------------------

export function useScenarioBodyParts() {
  const supabase = useMemo(() => createClient(), []);

  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarioBodyParts(supabase)
      .then(setBodyParts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load body parts'))
      .finally(() => setLoading(false));
  }, [supabase]);

  return { bodyParts, loading, error };
}
