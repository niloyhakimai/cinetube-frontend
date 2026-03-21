"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useSyncExternalStore,
} from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string | null;
}

type AuthSnapshot = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
};

type AuthContextValue = AuthSnapshot & {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
};

const emptySnapshot: AuthSnapshot = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
};

let currentSnapshot: AuthSnapshot = emptySnapshot;

const listeners = new Set<() => void>();

const parseStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = window.localStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    window.localStorage.removeItem('user');
    return null;
  }
};

const buildSnapshot = (): AuthSnapshot => {
  if (typeof window === 'undefined') {
    return emptySnapshot;
  }

  const token = window.localStorage.getItem('token');
  const user = parseStoredUser();

  return {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isHydrated: true,
  };
};

const emitChange = () => {
  currentSnapshot = buildSnapshot();
  listeners.forEach((listener) => listener());
};

if (typeof window !== 'undefined') {
  currentSnapshot = buildSnapshot();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  if (typeof window === 'undefined') {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = () => {
    currentSnapshot = buildSnapshot();
    listener();
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
};

const getSnapshot = () => currentSnapshot;

const getServerSnapshot = () => emptySnapshot;

const setAuthSession = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('token', token);
  window.localStorage.setItem('user', JSON.stringify(user));
  emitChange();
};

const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  emitChange();
};

const setStoredUser = (user: AuthUser) => {
  if (typeof window === 'undefined') {
    return;
  }

  const token = window.localStorage.getItem('token');

  if (!token) {
    clearAuthSession();
    return;
  }

  window.localStorage.setItem('user', JSON.stringify(user));
  emitChange();
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <AuthContext.Provider
      value={{
        ...snapshot,
        login: setAuthSession,
        logout: clearAuthSession,
        updateUser: setStoredUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
