import { useMemo, useState, useEffect, useCallback } from 'react';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchProfiles } from 'src/lib/supabase/queries/profiles';
// types
import type { IUserProfile } from 'src/types/user';

// ----------------------------------------------------------------------

export function useProfiles() {
  const supabase = useMemo(() => createClient(), []);

  const [profiles, setProfiles] = useState<IUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfiles(supabase);
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutateOne = useCallback((updated: IUserProfile) => {
    setProfiles((prev) => prev.map((profile) => (profile.id === updated.id ? updated : profile)));
  }, []);

  return { supabase, profiles, loading, error, refresh, mutateOne };
}
