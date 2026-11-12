"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  defaultPortfolioData,
  type PortfolioData,
} from "@/lib/portfolio-types";

interface PortfolioContextValue {
  data: PortfolioData;
  loading: boolean;
  refresh: () => Promise<void>;
  setLocalData: (next: PortfolioData) => void;
}

const PortfolioContext = createContext<PortfolioContextValue>({
  data: defaultPortfolioData,
  loading: false,
  refresh: async () => {},
  setLocalData: () => {},
});

const LOCAL_CACHE_KEY = "portfolio_cms_cache_v1";

export function PortfolioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      if (res.ok) {
        const remote = (await res.json()) as PortfolioData;
        setData(remote);
        try {
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(remote));
        } catch {
          // Ignore storage quota errors
        }
        return;
      }
    } catch {
      // Fallback to localStorage cache if offline
      try {
        const cached = localStorage.getItem(LOCAL_CACHE_KEY);
        if (cached) {
          setData(JSON.parse(cached) as PortfolioData);
        }
      } catch {
        // Ignore parse errors
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setLocalData = useCallback((next: PortfolioData) => {
    setData(next);
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  return (
    <PortfolioContext.Provider
      value={{ data, loading, refresh, setLocalData }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}

