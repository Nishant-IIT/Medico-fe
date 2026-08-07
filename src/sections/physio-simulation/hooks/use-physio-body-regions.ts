import { useState, useEffect } from 'react';
// lib
import { fetchPhysioRegions } from 'src/lib/supabase/queries/physio-simulation';
// types
import type { PhysioBodyRegion } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------

export function usePhysioBodyRegions() {
  const [regions, setRegions] = useState<PhysioBodyRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhysioRegions()
      .then(setRegions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load body regions'))
      .finally(() => setLoading(false));
  }, []);

  return { regions, loading, error };
}
