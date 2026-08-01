'use client';

import { useEffect, useReducer, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
// lib
import { createClient } from 'src/lib/supabase/client';
//
import { AuthContext } from './auth-context';
import { mapAppRole } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const supabase = useMemo(() => createClient(), []);

  // Role comes from the verified JWT claim (source of truth for RLS too);
  // full_name comes from public.profiles since it isn't in the token.
  const buildUser = useCallback(
    async (session: Session): Promise<AuthUserType> => {
      const { data, error } = await supabase.auth.getClaims(session.access_token);

      if (error || !data) return null;

      const { claims } = data;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', claims.sub)
        .single();

      return {
        id: claims.sub,
        email: claims.email,
        displayName: profile?.full_name || claims.email,
        role: mapAppRole(claims['user_role']),
        photoURL: null,
      };
    },
    [supabase]
  );

  // Fires immediately with the current session on mount, then again on
  // every sign-in/sign-out/token-refresh (including from other tabs).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session ? await buildUser(session) : null;
      dispatch({ type: Types.INITIAL, payload: { user } });
    });

    return () => subscription.unsubscribe();
  }, [supabase, buildUser]);

  // LOGIN
  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw new Error(error.message);
      if (!data.session) throw new Error('Login did not return a session');

      const user = await buildUser(data.session);

      dispatch({
        type: Types.LOGIN,
        payload: {
          user,
        },
      });

      return user;
    },
    [supabase, buildUser]
  );

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: `${firstName} ${lastName}` } },
      });

      if (error) throw new Error(error.message);

      if (!data.session) {
        // Project has email confirmations enabled -- no session is issued
        // until the user clicks the link in their inbox.
        throw new Error('Check your inbox to confirm your email before signing in.');
      }

      const user = await buildUser(data.session);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user,
        },
      });
    },
    [supabase, buildUser]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({
      type: Types.LOGOUT,
    });
  }, [supabase]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
