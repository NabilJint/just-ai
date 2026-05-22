"use client";

import React, { useCallback, useMemo, type CSSProperties } from "react";
// lightweight local error boundary to avoid adding an external dependency
interface SimpleErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

class SimpleErrorBoundary extends React.Component<
  SimpleErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ClientCanvas error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback as React.ReactNode;
    }

    return this.props.children as React.ReactNode;
  }
}
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import ShapePanel from "./ShapePanel";
import { CanvasShapeNode } from "./nodes/CanvasShapeNodes";
import { generateNodeId } from "@/lib/node-id";
import {
  DEFAULT_NODE_COLOR,
  isCanvasNodeShape,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
  type CanvasNodeSize,
} from "@/types/canvas";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

interface ClientCanvasProps {
  roomId: string;
}

interface ShapeDragPayload {
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
}

const nodeTypes = {
  rectangle: CanvasShapeNode,
  diamond: CanvasShapeNode,
  circle: CanvasShapeNode,
  pill: CanvasShapeNode,
  cylinder: CanvasShapeNode,
  hexagon: CanvasShapeNode,
  canvasNode: CanvasShapeNode,
} satisfies NodeTypes;

function readShapePayload(dataTransfer: DataTransfer): ShapeDragPayload | null {
  const jsonPayload = dataTransfer.getData("application/json");

  if (jsonPayload) {
    try {
      const parsed = JSON.parse(jsonPayload) as Partial<ShapeDragPayload>;

      if (
        parsed.shape &&
        isCanvasNodeShape(parsed.shape) &&
        parsed.size &&
        typeof parsed.size.width === "number" &&
        typeof parsed.size.height === "number"
      ) {
        return {
          shape: parsed.shape,
          size: parsed.size,
        };
      }
    } catch {
      return null;
    }
  }

  const shape = dataTransfer.getData("application/reactflow");

  if (isCanvasNodeShape(shape)) {
    return {
      shape,
      size: shape === "circle" ? { width: 112, height: 112 } : { width: 160, height: 90 },
    };
  }

  return null;
}

function getMiniMapShape(node: CanvasNode) {
  if (isCanvasNodeShape(node.type ?? "")) {
    return node.type as CanvasNodeShape;
  }

  return node.data?.shape ?? "rectangle";
}

interface MiniMapShapeNodeProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: React.MouseEvent<SVGElement>, id: string) => void;
}

function getMiniMapShapeFromClassName(className?: string) {
  const shape = className
    ?.split(" ")
    .find((name) => name.startsWith("minimap-shape-"))
    ?.replace("minimap-shape-", "");

  return shape && isCanvasNodeShape(shape) ? shape : "rectangle";
}

function MiniMapShapeNode({
  id,
  x,
  y,
  width,
  height,
  color,
  strokeColor,
  strokeWidth = 1,
  selected,
  className,
  onClick,
}: MiniMapShapeNodeProps) {
  const shape = getMiniMapShapeFromClassName(className);
  const fill = color ?? DEFAULT_NODE_COLOR.minimap;
  const stroke = strokeColor ?? DEFAULT_NODE_COLOR.stroke;
  const effectiveStrokeWidth = selected ? strokeWidth + 1 : strokeWidth;
  const clickProps = onClick
    ? { onClick: (event: React.MouseEvent<SVGElement>) => onClick(event, id) }
    : {};

  if (shape === "diamond") {
    return (
      <polygon
        points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${
          x + width / 2
        },${y + height} ${x},${y + height / 2}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={effectiveStrokeWidth}
        className={className}
        {...clickProps}
      />
    );
  }

  if (shape === "circle") {
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={effectiveStrokeWidth}
        className={className}
        {...clickProps}
      />
    );
  }

  if (shape === "cylinder") {
    const ellipseHeight = Math.max(2, Math.min(10, height * 0.22));

    return (
      <g className={className} {...clickProps}>
        <path
          d={`M${x} ${y + ellipseHeight / 2} C${x} ${y} ${x + width} ${y} ${
            x + width
          } ${y + ellipseHeight / 2} V${y + height - ellipseHeight / 2} C${
            x + width
          } ${y + height} ${x} ${y + height} ${x} ${
            y + height - ellipseHeight / 2
          } Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={effectiveStrokeWidth}
        />
        <ellipse
          cx={x + width / 2}
          cy={y + ellipseHeight / 2}
          rx={width / 2}
          ry={ellipseHeight / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={effectiveStrokeWidth}
        />
      </g>
    );
  }

  if (shape === "hexagon") {
    return (
      <polygon
        points={`${x + width * 0.25},${y} ${x + width * 0.75},${y} ${
          x + width
        },${y + height / 2} ${x + width * 0.75},${y + height} ${
          x + width * 0.25
        },${y + height} ${x},${y + height / 2}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={effectiveStrokeWidth}
        className={className}
        {...clickProps}
      />
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={shape === "pill" ? height / 2 : 3}
      ry={shape === "pill" ? height / 2 : 3}
      fill={fill}
      stroke={stroke}
      strokeWidth={effectiveStrokeWidth}
      className={className}
      {...clickProps}
    />
  );
}

function CanvasFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDelete,
}: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>) {
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const payload = readShapePayload(e.dataTransfer);
      if (!payload) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const color = NODE_COLORS[payload.shape] ?? DEFAULT_NODE_COLOR;
      const id = generateNodeId(payload.shape);

      const newNode: CanvasNode = {
        id,
        type: payload.shape,
        position,
        width: payload.size.width,
        height: payload.size.height,
        data: {
          label: "",
          color,
          shape: payload.shape,
          size: payload.size,
        },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  return (
    <div className="relative h-full w-full bg-bg-base">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        fitView
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <MiniMap
          bgColor="var(--bg-surface)"
          maskColor="color-mix(in srgb, var(--bg-base) 68%, transparent)"
          nodeStrokeColor={(node) => {
            const shape = getMiniMapShape(node as CanvasNode);
            return (node as CanvasNode).data?.color?.stroke ?? NODE_COLORS[shape].stroke;
          }}
          nodeColor={(node) => {
            const shape = getMiniMapShape(node as CanvasNode);
            return (node as CanvasNode).data?.color?.minimap ?? NODE_COLORS[shape].minimap;
          }}
          nodeClassName={(node) => {
            const shape = getMiniMapShape(node as CanvasNode);
            return `minimap-shape-${shape}`;
          }}
          nodeComponent={MiniMapShapeNode}
        />
        <Cursors />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} />
      </ReactFlow>

      <ShapePanel />
    </div>
  );
}

function CanvasInner() {
  const {
    nodes,
    edges,
    isLoading,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const flowProps = useMemo(
    () => ({
      nodes,
      edges,
      isLoading,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onDelete,
    }),
    [edges, isLoading, nodes, onConnect, onDelete, onEdgesChange, onNodesChange],
  );

  return (
    <ReactFlowProvider>
      <CanvasFlow {...flowProps} />
    </ReactFlowProvider>
  );
}

export default function ClientCanvas({ roomId }: ClientCanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <SimpleErrorBoundary fallback={<div className="p-4">Canvas error</div>}>
          <ClientSideSuspense
            fallback={
              <div className="h-full w-full flex items-center justify-center">
                Connecting…
              </div>
            }
          >
            <CanvasInner />
          </ClientSideSuspense>
        </SimpleErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
