"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { SignUpModal } from "@/components/auth/SignUpModal";

interface AuthGateContextValue {
  isAuthenticated: boolean;
  requestAuth: () => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const requestAuth = useCallback(() => setModalOpen(true), []);

  const value = useMemo(
    () => ({ isAuthenticated, requestAuth }),
    [isAuthenticated, requestAuth],
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <SignUpModal open={modalOpen} onOpenChange={setModalOpen} />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateContextValue {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error("useAuthGate must be used within AuthGateProvider");
  }
  return ctx;
}

/** Optional hook — returns null outside a provider (e.g. homepage cards). */
export function useOptionalAuthGate(): AuthGateContextValue | null {
  return useContext(AuthGateContext);
}
