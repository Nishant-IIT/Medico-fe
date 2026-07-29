'use client';

import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

// ----------------------------------------------------------------------

// Hardcoded demo credentials (the remote demo API is unreliable, so the
// demo login/session is handled entirely on the client).
const DEMO_EMAIL = 'demo@minimals.cc';
const DEMO_PASSWORD = 'demo1234';

const DEMO_USER = {
  id: '8864c717-587d-472a-929a-8e5f298024da-0',
  displayName: 'Jaydon Frankie',
  email: DEMO_EMAIL,
  photoURL: '/assets/images/avatar/avatar_25.jpg',
  phoneNumber: '+40 777666555',
  country: 'United States',
  address: '90210 Broadway Blvd',
  state: 'California',
  city: 'San Francisco',
  zipCode: '94116',
  about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
  role: 'admin',
  isPublic: true,
};

function createDemoToken() {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = { user: DEMO_USER, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3 };

  const base64 = (obj: object) => window.btoa(JSON.stringify(obj));

  return `${base64(header)}.${base64(payload)}.demo-signature`;
}

function decodeDemoUser(accessToken: string) {
  const base64Url = accessToken.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const { user } = JSON.parse(window.atob(base64));
  return user;
}

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

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

const STORAGE_KEY = 'accessToken';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const user = decodeDemoUser(accessToken);

        dispatch({
          type: Types.INITIAL,
          payload: {
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error('Incorrect email or password');
    }

    const accessToken = createDemoToken();

    setSession(accessToken);

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: DEMO_USER,
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const data = {
        email,
        password,
        firstName,
        lastName,
      };

      const response = await axios.post(endpoints.auth.register, data);

      const { accessToken, user } = response.data;

      sessionStorage.setItem(STORAGE_KEY, accessToken);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user,
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

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
