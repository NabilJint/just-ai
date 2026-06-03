"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useOthers, useOther } from "@liveblocks/react/suspense";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { type CursorsCursorProps } from "@liveblocks/react-flow";
import { AI_AGENT_USER_ID } from "@/lib/design-agent-constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * C1 — Resolve the first available avatar URL from all supported field names.
 * Priority order: avatar, profileImage, photo, avatarUrl.
 *
 * Uses indexed access so runtime data with extra fields (set via REST API or
 * other code paths like design-agent-liveblocks.ts) is found even when those
 * fields aren't part of the strict Liveblocks UserMeta type.
 */
function resolveAvatarUrl(info: Record<string, unknown>): string | null {
  const candidates = ["avatar", "profileImage", "photo", "avatarUrl"];
  for (const key of candidates) {
    const val = info[key];
    if (typeof val === "string" && val.length > 0) {
      return val;
    }
  }
  return null;
}

/**
 * C5 — Accept absolute HTTPS URLs or same-origin relative paths.
 */
function isValidHttpsUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Avatar sub-component (handles single avatar rendering with error tracking)
// ---------------------------------------------------------------------------

interface AvatarCellProps {
  info: {
    userId?: string | null;
    displayName?: string | null;
  } & Record<string, unknown>;
  isAi: boolean;
  onLoadError: (userId: string) => void;
  /** Set of user IDs whose images have previously failed to load */
  failedAvatars: Set<string>;
}

const AVATAR_SIZE_PX = 28;

function AvatarCell({ info, isAi, onLoadError, failedAvatars }: AvatarCellProps) {
  const userId = info.userId ?? "unknown";
  const rawUrl = resolveAvatarUrl(info);

  // C5 — Only render <img> if URL is valid HTTPS and hasn't failed before
  const shouldRenderImg =
    rawUrl !== null &&
    isValidHttpsUrl(rawUrl) &&
    !failedAvatars.has(userId);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bg-muted ring-2 ring-bg-elevated",
        isAi && "ring-accent-ai/60",
      )}
      style={{ width: AVATAR_SIZE_PX, height: AVATAR_SIZE_PX, borderRadius: "50%" }}
      title={info.displayName ?? undefined}
    >
      {shouldRenderImg ? (
        <img
          src={rawUrl!}
          alt={info.displayName ?? "Collaborator"}
          // C3 — Never stretch or distort, always fill
          className="w-full h-full object-cover"
          // C2 — Track runtime load failures
          onError={() => onLoadError(userId)}
        />
      ) : (
        // C1 — Fallback circle
        <div
          className={cn(
            "flex items-center justify-center w-full h-full text-xs font-medium select-none",
            isAi ? "text-accent-ai-text" : "text-text-primary",
          )}
        >
          {info.displayName?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PresenceAvatars (top-level component)
// ---------------------------------------------------------------------------

export function PresenceAvatars() {
  const { user } = useUser();
  const others = useOthers();
  const currentUserId = user?.id;

  // C2 — Track images that have failed to load so we don't retry
  const [failedAvatars, setFailedAvatars] = React.useState<Set<string>>(new Set());

  const handleLoadError = React.useCallback((userId: string) => {
    setFailedAvatars((prev) => {
      if (prev.has(userId)) return prev; // already tracked
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  }, []);

  // C4 — Build a deduplicated map, always merging (never replacing) user objects.
  // Liveblocks already merges presence internally; this loop simply dedupes by userId.
  const uniqueCollaborators = new Map<string, (typeof others)[number]["info"]>();

  others.forEach((other) => {
    const info = other.info;
    const participantId = info?.userId ?? other.id?.toString();
    if (!participantId || participantId === currentUserId) return;

    // C4 — If this participant already exists, merge new fields into existing
    const existing = uniqueCollaborators.get(participantId);
    if (existing) {
      uniqueCollaborators.set(participantId, { ...existing, ...info });
    } else {
      uniqueCollaborators.set(participantId, info);
    }
  });

  const collaborators = Array.from(uniqueCollaborators.values());
  const maxCollaborators = 5;
  const visibleCollaborators = collaborators.slice(0, maxCollaborators);
  const overflowCount = collaborators.length - maxCollaborators;

  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-2 p-1.5 rounded-2xl bg-bg-elevated/90 backdrop-blur-sm border border-border shadow-lg">
      {collaborators.length > 0 && (
        <div className="flex items-center -space-x-2 mr-1">
          {visibleCollaborators.map((collaborator) => {
            const isAi = collaborator?.userId === AI_AGENT_USER_ID;
            return (
              <AvatarCell
                key={collaborator?.userId ?? "unknown"}
                info={collaborator}
                isAi={isAi}
                failedAvatars={failedAvatars}
                onLoadError={handleLoadError}
              />
            );
          })}
          {overflowCount > 0 && (
            <div
              className="flex items-center justify-center bg-bg-muted ring-2 ring-bg-elevated text-xs font-medium text-text-primary select-none"
              style={{ width: AVATAR_SIZE_PX, height: AVATAR_SIZE_PX, borderRadius: "50%" }}
            >
              +{overflowCount}
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && <div className="h-6 w-px bg-border mx-1" />}

      <UserButton
        appearance={{
          elements: {
            avatarBox: "size-7 rounded-full ring-2 ring-bg-elevated",
            userButtonTrigger:
              "rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          },
        }}
      />
    </div>
  );
}

export function CustomCursor({ connectionId }: CursorsCursorProps) {
  const other = useOther(connectionId, (u) => u);
  if (!other) return null;

  const { cursorColor, displayName, userId } = other.info || {};
  if (!cursorColor) return null;

  const isAi = userId === AI_AGENT_USER_ID;
  const isThinking = Boolean(other.presence?.isThinking);

  return (
    <div className="pointer-events-none relative transition-transform">
      <svg
        className="absolute top-0 left-0"
        style={{ transform: "translate(-2px, -2px)" }}
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={cursorColor}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className={cn(
          "absolute top-5 left-5 rounded-md px-2 py-0.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap",
          isAi && "ring-1 ring-accent-ai-text/50",
        )}
        style={{ backgroundColor: cursorColor }}
      >
        {displayName}
        {isThinking ? " · thinking" : ""}
      </div>
    </div>
  );
}
