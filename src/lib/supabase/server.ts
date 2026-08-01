import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
// config
import { SUPABASE_API } from 'src/config-global';

// ----------------------------------------------------------------------

/**
 * Server Components / Server Actions / Route Handlers only. Creates a new
 * client per call since cookies() is request-scoped in the App Router --
 * never cache or reuse this across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_API.url, SUPABASE_API.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component -- ignored because the
          // middleware below is what actually refreshes the session.
        }
      },
    },
  });
}
