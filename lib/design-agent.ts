import type { DesignAgentPayload } from "@/trigger/design-agent";

export interface DesignTriggerBody {
  prompt: string;
  roomId: string;
  projectId: string;
}

export interface DesignTokenBody {
  runId: string;
}

export function parseDesignTriggerBody(value: unknown): DesignTriggerBody | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.prompt !== "string" ||
    !record.prompt.trim() ||
    typeof record.roomId !== "string" ||
    !record.roomId.trim() ||
    typeof record.projectId !== "string" ||
    !record.projectId.trim()
  ) {
    return null;
  }

  return {
    prompt: record.prompt.trim(),
    roomId: record.roomId.trim(),
    projectId: record.projectId.trim(),
  };
}

export function parseDesignTokenBody(value: unknown): DesignTokenBody | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.runId !== "string" || !record.runId.trim()) {
    return null;
  }

  return { runId: record.runId.trim() };
}

export function toDesignTaskPayload(body: DesignTriggerBody): DesignAgentPayload {
  return {
    prompt: body.prompt,
    roomId: body.roomId,
  };
}
