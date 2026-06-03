import { getLiveblocksClient } from "@/lib/liveblocks";
import type { AiStatusPhase } from "@/types/tasks";
import {
  AI_AGENT_AVATAR_URL,
  AI_AGENT_CURSOR_COLOR,
  AI_AGENT_DISPLAY_NAME,
  AI_AGENT_USER_ID,
  AI_PRESENCE_TTL_ACTIVE,
  AI_PRESENCE_TTL_CLEAR,
} from "@/lib/design-agent-constants";

export async function publishAiStatus(
  roomId: string,
  phase: AiStatusPhase,
  message: string,
  runId?: string,
): Promise<void> {
  const client = getLiveblocksClient();
  const event = {
    type: "ai-status" as const,
    phase,
    message,
    runId,
    at: Date.now(),
  };

  await client.broadcastEvent(roomId, event);
}

export async function setAiPresence(
  roomId: string,
  options: {
    cursor?: { x: number; y: number } | null;
    isThinking: boolean;
    ttl?: number;
  },
): Promise<void> {
  const client = getLiveblocksClient();

  await client.setPresence(roomId, {
    userId: AI_AGENT_USER_ID,
    data: {
      cursor: options.cursor ?? null,
      isThinking: options.isThinking,
    },
    userInfo: {
      name: AI_AGENT_DISPLAY_NAME,
      avatar: AI_AGENT_AVATAR_URL,
      profileImage: AI_AGENT_AVATAR_URL,
      photo: AI_AGENT_AVATAR_URL,
      color: AI_AGENT_CURSOR_COLOR,
      userId: AI_AGENT_USER_ID,
      displayName: AI_AGENT_DISPLAY_NAME,
      avatarUrl: AI_AGENT_AVATAR_URL,
      cursorColor: AI_AGENT_CURSOR_COLOR,
    },
    ttl: options.ttl ?? AI_PRESENCE_TTL_ACTIVE,
  });
}

export async function clearAiPresence(roomId: string): Promise<void> {
  await setAiPresence(roomId, {
    cursor: null,
    isThinking: false,
    ttl: AI_PRESENCE_TTL_CLEAR,
  });
}
