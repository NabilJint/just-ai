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
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  // Keep refs in sync with latest nodes/edges from Liveblocks
  nodesRef.current = nodes;
  edgesRef.current = edges;

  useEffect(() => {
    if (isLoading || hasAttemptedLoadRef.current) {
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

        // Use refs to get the latest nodes/edges in case Liveblocks Storage
        // resolved after the effect was scheduled (defensive — with suspense
        // mode this shouldn't happen, but refs are cheap insurance).
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;

        // Remove all existing nodes/edges from Liveblocks Storage, then add
        // the Blob snapshot — all in a single atomic change so undo/redo
        // history treats the entire hydration as one step.
        onNodesChange([
          ...currentNodes.map((n) => ({ type: "remove" as const, id: n.id })),
          ...savedNodes.map((item) => ({ type: "add" as const, item })),
        ]);

        onEdgesChange([
          ...currentEdges.map((e) => ({ type: "remove" as const, id: e.id })),
          ...savedEdges.map((item) => ({ type: "add" as const, item })),
        ]);

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
