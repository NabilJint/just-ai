"use client";

import React from "react";
import { useOthers, useOther } from "@liveblocks/react/suspense";
import { UserButton, useUser } from "@clerk/nextjs";
import { type CursorsCursorProps } from "@liveblocks/react-flow";

export function PresenceAvatars() {
  const { user } = useUser();
  const others = useOthers();
  
  const currentUserId = user?.id;

  const uniqueCollaborators = new Map();
  others.forEach((other) => {
    if (other.info?.userId && other.info.userId !== currentUserId) {
       if (!uniqueCollaborators.has(other.info.userId)) {
           uniqueCollaborators.set(other.info.userId, other.info);
       }
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
          {visibleCollaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="relative size-[25px] rounded-xl ring-2 ring-bg-elevated overflow-hidden bg-bg-muted"
            >
              {collaborator.avatarUrl ? (
                <img
                  src={collaborator.avatarUrl}
                  alt={collaborator.displayName ?? "Collaborator"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xs font-medium text-text-primary uppercase">
                  {collaborator.displayName?.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {overflowCount > 0 && (
            <div className="relative size-8 rounded-xl ring-2 ring-bg-elevated overflow-hidden bg-bg-muted flex items-center justify-center text-xs font-medium text-text-primary">
              +{overflowCount}
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && <div className="h-6 w-px bg-border mx-1" />}

      <UserButton
        appearance={{
          elements: {
            avatarBox:
              "size-8 rounded-xl border border-border ring-2 ring-bg-elevated",
            userButtonTrigger:
              "rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-duo-green",
          },
        }}
      />
    </div>
  );
}

export function CustomCursor({ connectionId }: CursorsCursorProps) {
  const other = useOther(connectionId, (u) => u);
  if (!other) return null;

  const { cursorColor, displayName } = other.info || {};
  if (!cursorColor) return null;

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
        className="absolute top-5 left-5 rounded-md px-2 py-0.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap"
        style={{ backgroundColor: cursorColor }}
      >
        {displayName}
      </div>
    </div>
  );
}
