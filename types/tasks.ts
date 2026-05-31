export type AiStatusPhase = "start" | "processing" | "complete" | "error";

export interface AiStatusFeedPayload {
  text?: string;
  phase: AiStatusPhase;
  runId?: string;
  timestamp: number;
}

export interface AiChatFeedPayload {
  sender: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

