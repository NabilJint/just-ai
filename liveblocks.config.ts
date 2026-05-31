// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Storage: {
      // Example, a conflict-free list
      // animals: LiveList<string>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        userId: string;
        displayName: string;
        avatarUrl: string | null;
        cursorColor: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent:
      | {
          type: "ai-status";
          phase: "start" | "processing" | "complete" | "error";
          message: string;
          runId?: string;
          at: number;
        }
      | {
          type: "ai-chat";
          sender: string;
          role: "user" | "assistant" | "system";
          content: string;
          at: number;
        };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    ThreadMetadata: {
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string;
      // url: string;
    };
  }
}

export {};
