"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { AiStatusFeedPayload } from "@/types/tasks";

interface AiRoomContextValue {
  isAiRunning: boolean;
  setAiRunning: (running: boolean) => void;
  latestStatus: AiStatusFeedPayload | null;
  setLatestStatus: (status: AiStatusFeedPayload | null) => void;
}

const AiRoomContext = createContext<AiRoomContextValue>({
  isAiRunning: false,
  setAiRunning: () => {},
  latestStatus: null,
  setLatestStatus: () => {},
});

export function AiRoomProvider({ children }: { children: ReactNode }) {
  const [isAiRunning, setAiRunning] = useState(false);
  const [latestStatus, setLatestStatus] = useState<AiStatusFeedPayload | null>(null);

  return (
    <AiRoomContext.Provider value={{ isAiRunning, setAiRunning, latestStatus, setLatestStatus }}>
      {children}
    </AiRoomContext.Provider>
  );
}

export function useAiRoomContext() {
  return useContext(AiRoomContext);
}
