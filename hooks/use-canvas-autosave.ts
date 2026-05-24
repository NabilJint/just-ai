"use client";

import { useEffect, useRef } from "react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { useCanvasSaveStatusSetter } from "@/hooks/use-canvas-save-status";

const AUTOSAVE_DEBOUNCE_MS = 1500;

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isReady: boolean;
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  isReady,
}: UseCanvasAutosaveOptions) {
  const setSaveStatus = useCanvasSaveStatusSetter();
  const hasHydratedRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setSaveStatus("saving");

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Canvas save failed");
        }

        setSaveStatus("saved");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSaveStatus("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [edges, isReady, nodes, projectId, setSaveStatus]);

  return {
    skipNextSave: () => {
      skipNextSaveRef.current = true;
    },
  };
}
