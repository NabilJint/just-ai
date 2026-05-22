import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#58cc02",
  "#1cb0f6",
  "#ffc700",
  "#a570ff",
  "#cc348d",
  "#0ac7b4",
  "#ff990a",
  "#ff6166",
] as const;

declare global {
  var liveblocksClient: Liveblocks | undefined;
}

export function getCursorColor(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

export function getLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  }

  if (!globalThis.liveblocksClient) {
    globalThis.liveblocksClient = new Liveblocks({ secret });
  }

  return globalThis.liveblocksClient;
}
