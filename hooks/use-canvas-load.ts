"use client";

import { useEffect, useRef } from "react";
import type { EdgeChange, NodeChange } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { useCanvasSaveStatusSetter } from "@/hooks/use-canvas-save-status";

interface UseCanvasLoadOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isLoading: boolean;
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
  onReady: () => void;
}

export function useCanvasLoad({
  projectId,
  nodes,
  edges,
  isLoading,
  onNodesChange,
  onEdgesChange,
  onReady,
}: UseCanvasLoadOptions) {
  const setSaveStatus = useCanvasSaveStatusSetter();
  const hasAttemptedLoadRef = useRef(false);

  useEffect(() => {
    if (isLoading || hasAttemptedLoadRef.current) {
      return;
    }

    if (nodes.length > 0 || edges.length > 0) {
      hasAttemptedLoadRef.current = true;
      onReady();
      return;
    }

    hasAttemptedLoadRef.current = true;

    async function loadSavedCanvas() {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          nodes?: CanvasNode[];
          edges?: CanvasEdge[];
        };

        const savedNodes = data.nodes ?? [];
        const savedEdges = data.edges ?? [];

        if (savedNodes.length === 0 && savedEdges.length === 0) {
          return;
        }

        onNodesChange(savedNodes.map((item) => ({ type: "add", item })));
        onEdgesChange(savedEdges.map((item) => ({ type: "add", item })));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      } finally {
        onReady();
      }
    }

    void loadSavedCanvas();
  }, [
    edges.length,
    isLoading,
    nodes.length,
    onEdgesChange,
    onNodesChange,
    onReady,
    projectId,
    setSaveStatus,
  ]);
}
