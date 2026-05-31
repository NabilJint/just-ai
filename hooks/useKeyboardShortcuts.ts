"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface UseKeyboardShortcutsOptions {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  onUndo: () => void;
  onRedo: () => void;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}

export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const isCommand = event.metaKey || event.ctrlKey;

      if (isCommand && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        return;
      }

      if (isCommand && key === "y") {
        event.preventDefault();
        onRedo();
        return;
      }

      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          void reactFlow.zoomIn({ duration: 160 });
          return;
        }

        if (event.key === "-") {
          event.preventDefault();
          void reactFlow.zoomOut({ duration: 160 });
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onRedo, onUndo, reactFlow]);
}
