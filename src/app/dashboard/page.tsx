'use client';

import { useEffect } from 'react';
// routes
import { useRouter } from 'src/routes/hooks';
// config
import { getPathAfterLogin } from 'src/config-global';
// auth
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();

  const { user } = useAuthContext();

  useEffect(() => {
    router.replace(getPathAfterLogin(user?.role));
  }, [router, user]);

  return null;
}
