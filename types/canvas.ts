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

export const NODE_COLOR_PALETTE: CanvasNodeColor[] = [
  { fill: "var(--node-palette-neutral-fill)", text: "var(--node-palette-neutral-text)", stroke: "var(--node-palette-neutral-stroke)", minimap: "var(--node-palette-neutral-stroke)" }, // Neutral dark
  { fill: "var(--node-palette-blue-fill)", text: "var(--node-palette-blue-text)", stroke: "var(--node-palette-blue-stroke)", minimap: "var(--node-palette-blue-stroke)" }, // Blue
  { fill: "var(--node-palette-purple-fill)", text: "var(--node-palette-purple-text)", stroke: "var(--node-palette-purple-stroke)", minimap: "var(--node-palette-purple-stroke)" }, // Purple
  { fill: "var(--node-palette-orange-fill)", text: "var(--node-palette-orange-text)", stroke: "var(--node-palette-orange-stroke)", minimap: "var(--node-palette-orange-stroke)" }, // Orange
  { fill: "var(--node-palette-red-fill)", text: "var(--node-palette-red-text)", stroke: "var(--node-palette-red-stroke)", minimap: "var(--node-palette-red-stroke)" }, // Red
  { fill: "var(--node-palette-pink-fill)", text: "var(--node-palette-pink-text)", stroke: "var(--node-palette-pink-stroke)", minimap: "var(--node-palette-pink-stroke)" }, // Pink
  { fill: "var(--node-palette-green-fill)", text: "var(--node-palette-green-text)", stroke: "var(--node-palette-green-stroke)", minimap: "var(--node-palette-green-stroke)" }, // Green
  { fill: "var(--node-palette-teal-fill)", text: "var(--node-palette-teal-text)", stroke: "var(--node-palette-teal-stroke)", minimap: "var(--node-palette-teal-stroke)" }, // Teal
];


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
