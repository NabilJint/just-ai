"use client";

import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiRoomStatus } from "@/hooks/use-ai-room-status";

export function AiStatusFeed() {
  const { status, isRunning, validationError } = useAiRoomStatus();

  if (validationError) {
    return (
      <div
        className="absolute bottom-24 left-1/2 z-40 flex max-w-md -translate-x-1/2 items-center gap-2 rounded-2xl border border-state-error/40 bg-bg-elevated/95 px-4 py-2.5 shadow-lg backdrop-blur-md"
        role="alert"
      >
        <span className="text-sm text-state-error">
          {validationError}
        </span>
      </div>
    );
  }

  if (!status) return null;

  const isActive = isRunning;

  return (
    <div
      className={cn(
        "absolute bottom-24 left-1/2 z-40 flex max-w-md -translate-x-1/2 items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-md",
        status.phase === "error"
          ? "border-state-error/40 bg-bg-elevated/95 text-state-error"
          : "border-accent-ai/30 bg-bg-elevated/95 text-text-primary",
      )}
      role="status"
      aria-live="polite"
    >
      {isActive ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-accent-ai-text" />
      ) : (
        <Bot className="size-4 shrink-0 text-accent-ai-text" />
      )}
      <span className="text-sm font-medium">{status.text}</span>
    </div>
  );
}
