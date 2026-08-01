import { createBrowserClient } from '@supabase/ssr';
// config
import { SUPABASE_API } from 'src/config-global';

// ----------------------------------------------------------------------

export function createClient() {
  return createBrowserClient(SUPABASE_API.url, SUPABASE_API.publishableKey);
}
