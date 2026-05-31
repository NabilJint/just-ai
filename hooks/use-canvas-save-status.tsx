"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

interface CanvasSaveStatusContextValue {
  status: CanvasSaveStatus;
  setStatus: (status: CanvasSaveStatus) => void;
}

const CanvasSaveStatusContext = createContext<CanvasSaveStatusContextValue | null>(
  null,
);

export function CanvasSaveStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");

  const value = useMemo(
    () => ({
      status,
      setStatus,
    }),
    [status],
  );

  return (
    <CanvasSaveStatusContext.Provider value={value}>
      {children}
    </CanvasSaveStatusContext.Provider>
  );
}

export function useCanvasSaveStatus() {
  const context = useContext(CanvasSaveStatusContext);

  if (!context) {
    throw new Error(
      "useCanvasSaveStatus must be used within CanvasSaveStatusProvider",
    );
  }

  return context;
}

export function useCanvasSaveStatusSetter() {
  const { setStatus } = useCanvasSaveStatus();
  return useCallback(
    (status: CanvasSaveStatus) => {
      setStatus(status);
    },
    [setStatus],
  );
}
