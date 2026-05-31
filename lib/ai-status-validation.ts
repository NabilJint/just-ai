import type { AiStatusFeedPayload, AiStatusPhase } from "@/types/tasks";

const VALID_PHASES: AiStatusPhase[] = ["start", "processing", "complete", "error"];

export function isValidAiStatusPayload(raw: unknown): raw is AiStatusFeedPayload {
  if (typeof raw !== "object" || raw === null) return false;

  const payload = raw as Record<string, unknown>;

  if (!VALID_PHASES.includes(payload.phase as AiStatusPhase)) return false;
  if (typeof payload.timestamp !== "number") return false;
  if (payload.text !== undefined && typeof payload.text !== "string") return false;
  if (payload.runId !== undefined && typeof payload.runId !== "string") return false;

  return true;
}
