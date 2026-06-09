"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ProductVoteContext = createContext<{
  netVotes: number;
  setNetVotes: (n: number) => void;
} | null>(null);

export function ProductVoteProvider({
  initialNetVotes,
  children,
}: {
  initialNetVotes: number;
  children: ReactNode;
}) {
  const [netVotes, setNetVotes] = useState(initialNetVotes);
  const value = useMemo(
    () => ({ netVotes, setNetVotes }),
    [netVotes],
  );
  return (
    <ProductVoteContext.Provider value={value}>
      {children}
    </ProductVoteContext.Provider>
  );
}

export function useProductVoteCount() {
  const ctx = useContext(ProductVoteContext);
  if (!ctx) {
    throw new Error("useProductVoteCount must be used within ProductVoteProvider");
  }
  return ctx;
}
