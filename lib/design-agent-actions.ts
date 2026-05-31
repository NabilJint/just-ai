import {
  DEFAULT_NODE_COLOR,
  isCanvasNodeShape,
  NODE_COLOR_PALETTE,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeColor,
  type CanvasNodeShape,
} from "@/types/canvas";
import { generateNodeId } from "@/lib/node-id";
import {
  CANVAS_LAYOUT_GAP_X,
  CANVAS_LAYOUT_GAP_Y,
} from "@/lib/design-agent-constants";

export type DesignActionType =
  | "addNode"
  | "moveNode"
  | "resizeNode"
  | "updateNodeData"
  | "deleteNode"
  | "addEdge"
  | "deleteEdge";

export interface DesignActionBase {
  type: DesignActionType;
}

export interface AddNodeAction extends DesignActionBase {
  type: "addNode";
  tempId?: string;
  shape: CanvasNodeShape;
  label?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  paletteIndex?: number;
}

export interface MoveNodeAction extends DesignActionBase {
  type: "moveNode";
  id: string;
  x: number;
  y: number;
}

export interface ResizeNodeAction extends DesignActionBase {
  type: "resizeNode";
  id: string;
  width: number;
  height: number;
}

export interface UpdateNodeDataAction extends DesignActionBase {
  type: "updateNodeData";
  id: string;
  label?: string;
  paletteIndex?: number;
  shape?: CanvasNodeShape;
}

export interface DeleteNodeAction extends DesignActionBase {
  type: "deleteNode";
  id: string;
}

export interface AddEdgeAction extends DesignActionBase {
  type: "addEdge";
  tempId?: string;
  source: string;
  target: string;
  label?: string;
}

export interface DeleteEdgeAction extends DesignActionBase {
  type: "deleteEdge";
  id: string;
}

export type DesignAction =
  | AddNodeAction
  | MoveNodeAction
  | ResizeNodeAction
  | UpdateNodeDataAction
  | DeleteNodeAction
  | AddEdgeAction
  | DeleteEdgeAction;

export interface DesignPlan {
  actions: DesignAction[];
}

function defaultSizeForShape(shape: CanvasNodeShape) {
  if (shape === "circle") {
    return { width: 112, height: 112 };
  }

  return { width: 160, height: 90 };
}

export function resolveNodeColor(
  shape: CanvasNodeShape,
  paletteIndex?: number,
): CanvasNodeColor {
  if (
    typeof paletteIndex === "number" &&
    paletteIndex >= 0 &&
    paletteIndex < NODE_COLOR_PALETTE.length
  ) {
    return NODE_COLOR_PALETTE[paletteIndex];
  }

  return NODE_COLORS[shape] ?? DEFAULT_NODE_COLOR;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseAction(raw: unknown): DesignAction | null {
  if (!isRecord(raw) || typeof raw.type !== "string") {
    return null;
  }

  switch (raw.type) {
    case "addNode": {
      const shape = parseString(raw.shape);
      if (!shape || !isCanvasNodeShape(shape)) return null;

      const x = parseNumber(raw.x);
      const y = parseNumber(raw.y);
      if (x === null || y === null) return null;

      return {
        type: "addNode",
        tempId: parseString(raw.tempId) ?? undefined,
        shape,
        label: parseString(raw.label) ?? undefined,
        x,
        y,
        width: parseNumber(raw.width) ?? undefined,
        height: parseNumber(raw.height) ?? undefined,
        paletteIndex: parseNumber(raw.paletteIndex) ?? undefined,
      };
    }
    case "moveNode": {
      const id = parseString(raw.id);
      const x = parseNumber(raw.x);
      const y = parseNumber(raw.y);
      if (!id || x === null || y === null) return null;

      return { type: "moveNode", id, x, y };
    }
    case "resizeNode": {
      const id = parseString(raw.id);
      const width = parseNumber(raw.width);
      const height = parseNumber(raw.height);
      if (!id || width === null || height === null) return null;

      return { type: "resizeNode", id, width, height };
    }
    case "updateNodeData": {
      const id = parseString(raw.id);
      if (!id) return null;

      const shape = parseString(raw.shape);
      return {
        type: "updateNodeData",
        id,
        label: parseString(raw.label) ?? undefined,
        paletteIndex: parseNumber(raw.paletteIndex) ?? undefined,
        shape: shape && isCanvasNodeShape(shape) ? shape : undefined,
      };
    }
    case "deleteNode": {
      const id = parseString(raw.id);
      return id ? { type: "deleteNode", id } : null;
    }
    case "addEdge": {
      const source = parseString(raw.source);
      const target = parseString(raw.target);
      if (!source || !target) return null;

      return {
        type: "addEdge",
        tempId: parseString(raw.tempId) ?? undefined,
        source,
        target,
        label: parseString(raw.label) ?? undefined,
      };
    }
    case "deleteEdge": {
      const id = parseString(raw.id);
      return id ? { type: "deleteEdge", id } : null;
    }
    default:
      return null;
  }
}

export function parseDesignPlan(value: unknown): DesignPlan | null {
  if (!isRecord(value)) return null;

  const actionsRaw = Array.isArray(value.actions) ? value.actions : [];
  const actions = actionsRaw
    .map(parseAction)
    .filter((action): action is DesignAction => action !== null);

  if (actions.length === 0) return null;

  return { actions };
}

export function extractJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("Model response did not contain valid JSON");
  }
}

export function buildNodeFromAddAction(action: AddNodeAction): CanvasNode {
  const size = defaultSizeForShape(action.shape);
  const width = action.width ?? size.width;
  const height = action.height ?? size.height;
  const color = resolveNodeColor(action.shape, action.paletteIndex);

  return {
    id: generateNodeId(action.shape),
    type: action.shape,
    position: { x: action.x, y: action.y },
    width,
    height,
    data: {
      label: action.label ?? "",
      color,
      shape: action.shape,
      size: { width, height },
    },
  };
}

export function buildEdgeFromAddAction(
  action: AddEdgeAction,
  resolveId: (id: string) => string,
): CanvasEdge {
  const id =
    action.tempId && action.tempId.startsWith("e_")
      ? action.tempId
      : `e_${Math.random().toString(36).slice(2, 11)}`;

  return {
    id,
    type: "canvasEdge",
    source: resolveId(action.source),
    target: resolveId(action.target),
    data: { label: action.label ?? "" },
  };
}

export function getDesignConstraintsPrompt(): string {
  return [
    `Allowed node shapes: ${NODE_SHAPES.join(", ")}.`,
    `Use paletteIndex 0-${NODE_COLOR_PALETTE.length - 1} for node colors (optional).`,
    `Default layout gap: at least ${CANVAS_LAYOUT_GAP_X}px horizontally and ${CANVAS_LAYOUT_GAP_Y}px vertically between nodes.`,
    "Use addEdge with source/target referencing existing node ids or tempIds from addNode actions.",
    "Prefer rectangle for services, cylinder for databases, diamond for decisions, hexagon for external systems, pill for processes, circle for events.",
  ].join(" ");
}
