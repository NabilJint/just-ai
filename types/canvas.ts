import type { Edge, Node } from "@xyflow/react";

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type CanvasNodeShape = (typeof NODE_SHAPES)[number];

export interface CanvasNodeSize {
  width: number;
  height: number;
}

export interface CanvasNodeColor {
  fill: string;
  text: string;
  stroke: string;
  minimap: string;
}

export const DEFAULT_NODE_COLOR: CanvasNodeColor = {
  fill: "var(--bg-surface)",
  text: "var(--text-primary)",
  stroke: "var(--accent-primary)",
  minimap: "var(--accent-primary)",
};

export const NODE_COLORS: Record<CanvasNodeShape, CanvasNodeColor> = {
  rectangle: DEFAULT_NODE_COLOR,
  diamond: {
    fill: "var(--bg-surface)",
    text: "var(--text-primary)",
    stroke: "var(--accent-ai-text)",
    minimap: "var(--accent-ai-text)",
  },
  circle: {
    fill: "var(--bg-surface)",
    text: "var(--text-primary)",
    stroke: "var(--state-success)",
    minimap: "var(--state-success)",
  },
  pill: {
    fill: "var(--bg-surface)",
    text: "var(--text-primary)",
    stroke: "var(--sky-blue)",
    minimap: "var(--sky-blue)",
  },
  cylinder: {
    fill: "var(--bg-surface)",
    text: "var(--text-primary)",
    stroke: "var(--state-warning)",
    minimap: "var(--state-warning)",
  },
  hexagon: {
    fill: "var(--bg-surface)",
    text: "var(--text-primary)",
    stroke: "var(--bubblegum-pink)",
    minimap: "var(--bubblegum-pink)",
  },
};

export function isCanvasNodeShape(value: string): value is CanvasNodeShape {
  return NODE_SHAPES.includes(value as CanvasNodeShape);
}

export interface CanvasNodeData extends Record<string, unknown> {
  label?: string;
  color?: CanvasNodeColor;
  shape?: CanvasNodeShape;
  size?: CanvasNodeSize;
}

export type CanvasNodeType = CanvasNodeShape | "canvasNode";

export type CanvasNode = Node<CanvasNodeData, CanvasNodeType>;

export type CanvasEdge = Edge & {
  type?: "canvasEdge";
};

export type { Node, Edge };
