"use client";

import { useEffect, useState } from "react";
import { useEventListener } from "@liveblocks/react/suspense";
import type { AiStatusFeedPayload } from "@/types/tasks";
import { isValidAiStatusPayload } from "@/lib/ai-status-validation";

export function useAiRoomStatus() {
  const [status, setStatus] = useState<AiStatusFeedPayload | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEventListener(({ event }) => {
    if (event.type === "ai-status") {
      const payload: unknown = {
        text: (event as Record<string, unknown>).message as string | undefined,
        phase: (event as Record<string, unknown>).phase as string,
        runId: (event as Record<string, unknown>).runId as string | undefined,
        timestamp: (event as Record<string, unknown>).at as number,
      };

      if (!isValidAiStatusPayload(payload)) {
        setValidationError("Received invalid AI status event");
        return;
      }

      setValidationError(null);
      setStatus(payload);
    }
  });

  useEffect(() => {
    if (!status) return;

    if (status.phase === "complete" || status.phase === "error") {
      const timeout = setTimeout(() => setStatus(null), 6000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const isRunning =
    status?.phase === "start" || status?.phase === "processing";

  return { status, isRunning, validationError };
}
