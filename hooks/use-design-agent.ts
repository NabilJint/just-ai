"use client";

import { useCallback, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { designAgentTask } from "@/trigger/design-agent";

interface UseDesignAgentOptions {
  projectId: string;
  roomId: string;
}

export function useDesignAgent({ projectId, roomId }: UseDesignAgentOptions) {
  const [runId, setRunId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { run, error: runError } = useRealtimeRun<typeof designAgentTask>(
    runId ?? "",
    {
      accessToken: accessToken ?? "",
      enabled: Boolean(runId && accessToken),
    },
  );

  const isRunning =
    run?.status === "QUEUED" ||
    run?.status === "EXECUTING" ||
    run?.status === "DEQUEUED" ||
    isSubmitting;

  const submitPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isRunning) return;

      setSubmitError(null);
      setIsSubmitting(true);

      try {
        const designRes = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed, roomId, projectId }),
        });

        if (!designRes.ok) {
          const err = (await designRes.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(err?.error ?? "Failed to start design task");
        }

        const { runId: newRunId } = (await designRes.json()) as { runId: string };

        const tokenRes = await fetch("/api/ai/design/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: newRunId }),
        });

        if (!tokenRes.ok) {
          throw new Error("Failed to authorize run subscription");
        }

        const { token } = (await tokenRes.json()) as { token: string };

        setRunId(newRunId);
        setAccessToken(token);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isRunning, projectId, roomId],
  );

  const resetRun = useCallback(() => {
    setRunId(null);
    setAccessToken(null);
  }, []);

  const runStatusMessage = (() => {
    const logs = run?.metadata?.logs;
    if (Array.isArray(logs) && logs.length > 0) {
      return String(logs.at(-1));
    }
    if (typeof run?.metadata?.status === "string") {
      return run.metadata.status;
    }
    return null;
  })();

  return {
    submitPrompt,
    isRunning,
    submitError,
    run,
    runError,
    runStatusMessage,
    resetRun,
  };
}
