import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
// config
import { SUPABASE_API } from 'src/config-global';

// ----------------------------------------------------------------------

/**
 * Refreshes the Supabase session cookie on every request that matches the
 * middleware matcher. Route/role protection itself stays client-side
 * (AuthGuard/RoleBasedGuard) and server-side (RLS) -- this only keeps the
 * auth cookie from going stale between visits.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_API.url, SUPABASE_API.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not remove: this refreshes the token and must be called before any
  // other Supabase call in a Server Component to keep cookies in sync.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
