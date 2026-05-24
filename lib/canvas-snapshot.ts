import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export function getCanvasBlobPath(projectId: string) {
  return `canvas/${projectId}.json`;
}

export function parseCanvasSnapshot(value: unknown): CanvasSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    return null;
  }

  return {
    nodes: record.nodes as CanvasNode[],
    edges: record.edges as CanvasEdge[],
  };
}
