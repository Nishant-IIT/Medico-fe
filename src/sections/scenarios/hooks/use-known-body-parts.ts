import { useMemo, useState, useEffect } from 'react';
// lib
import { createClient } from 'src/lib/supabase/client';
import { fetchKnownBodyParts } from 'src/lib/supabase/queries/scenarios';

// ----------------------------------------------------------------------

/** Distinct body parts across every scenario (any status), for authoring-form suggestions. */
export function useKnownBodyParts() {
  const supabase = useMemo(() => createClient(), []);

  const [bodyParts, setBodyParts] = useState<string[]>([]);

  useEffect(() => {
    fetchKnownBodyParts(supabase)
      .then(setBodyParts)
      .catch(() => {});
  }, [supabase]);

  return bodyParts;
}
