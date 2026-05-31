"use client";

import React, { useCallback, useMemo, useEffect, useState } from "react";
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  ClientSideSuspense,
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import ShapePanel from "./ShapePanel";
import { CanvasShapeNode } from "./nodes/CanvasShapeNodes";
import { CanvasEdgeComponent } from "./edges/CanvasEdge";
import { PresenceAvatars, CustomCursor } from "./presence";
import { AiStatusFeed } from "./ai-status-feed";
import StarterTemplatesModal from "./starter-templates-modal";
import { type CanvasTemplate } from "./starter-templates";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import { useCanvasLoad } from "@/hooks/use-canvas-load";
import { useAiRoomStatus } from "@/hooks/use-ai-room-status";
import { useAiRoomContext } from "@/hooks/use-ai-room-context";
import { useCanvasState } from "@/hooks/use-canvas-state-context";
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

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
} satisfies EdgeTypes;

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: "rgba(255,255,255,0.38)",
  },
};

const viewportAnimation = { duration: 160 };

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

function CanvasFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDelete,
}: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>) {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const { screenToFlowPosition } = reactFlow;

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  useEffect(() => {
    const handleOpenTemplates = () => setIsTemplatesOpen(true);
    window.addEventListener("open-starter-templates", handleOpenTemplates);
    return () =>
      window.removeEventListener("open-starter-templates", handleOpenTemplates);
  }, []);

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      setIsTemplatesOpen(false);
      
      const currentNodes = reactFlow.getNodes();
      const currentEdges = reactFlow.getEdges();

      // 1. Clear current canvas completely via React Flow's native delete
      if (currentNodes.length > 0 || currentEdges.length > 0) {
        reactFlow.deleteElements({ nodes: currentNodes, edges: currentEdges });
      }
      
      // 2. Generate completely fresh IDs for the template to prevent Liveblocks CRDT conflicts
      const idMap = new Map<string, string>();
      const newNodes = template.nodes.map((node) => {
        const newId = generateNodeId(node.type as CanvasNodeShape);
        idMap.set(node.id, newId);
        return { ...node, id: newId };
      });
      
      const newEdges = template.edges.map((edge) => {
        const newId = `e_${Math.random().toString(36).slice(2, 11)}`;
        return {
          ...edge,
          id: newId,
          source: idMap.get(edge.source) ?? edge.source,
          target: idMap.get(edge.target) ?? edge.target,
        };
      });

      // 3. Load the selected template
      setTimeout(() => {
        onNodesChange(newNodes.map((item) => ({ type: "add", item })));
        onEdgesChange(newEdges.map((item) => ({ type: "add", item })));
        
        // 4. Reset viewport
        setTimeout(() => {
          void reactFlow.fitView({ padding: 0.2, duration: viewportAnimation.duration });
        }, 50);
      }, 50);
    },
    [onNodesChange, onEdgesChange, reactFlow]
  );

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
        position: {
          x: position.x - payload.size.width / 2,
          y: position.y - payload.size.height / 2,
        },
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

  const handleZoomOut = useCallback(() => {
    void reactFlow.zoomOut(viewportAnimation);
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    void reactFlow.fitView({ duration: viewportAnimation.duration, padding: 0.2 });
  }, [reactFlow]);

  const handleZoomIn = useCallback(() => {
    void reactFlow.zoomIn(viewportAnimation);
  }, [reactFlow]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  useKeyboardShortcuts({
    reactFlow,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  return (
    <div
      className="relative h-full w-full bg-bg-base"
    >
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
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <Cursors components={{ Cursor: CustomCursor }} />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} />
      </ReactFlow>

      <PresenceAvatars />
      <AiStatusFeed />

      <div className="absolute bottom-28 left-6 z-10">
        <div className="flex items-center gap-1 rounded-full border border-border bg-bg-elevated/90 px-2 py-2 text-text-secondary backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-xl"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFitView}
            className="rounded-xl"
            title="Fit view"
            aria-label="Fit view"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-xl"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            className="rounded-xl"
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            className="rounded-xl"
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <ShapePanel />
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onImport={handleImportTemplate}
      />
    </div>
  );
}

function AiStatusBridge() {
  const { isRunning, status } = useAiRoomStatus();
  const { setAiRunning, setLatestStatus } = useAiRoomContext();

  useEffect(() => {
    setAiRunning(isRunning);
    setLatestStatus(status);
  }, [isRunning, status, setAiRunning, setLatestStatus]);

  return null;
}

function CanvasInner({ projectId }: { projectId: string }) {
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

  const { setCanvasState } = useCanvasState();

  useEffect(() => {
    setCanvasState(nodes, edges);
  }, [nodes, edges, setCanvasState]);

  const [isAutosaveReady, setIsAutosaveReady] = useState(false);

  useCanvasLoad({
    projectId,
    nodes,
    edges,
    isLoading,
    onNodesChange,
    onEdgesChange,
    onReady: () => setIsAutosaveReady(true),
  });

  useCanvasAutosave({
    projectId,
    nodes,
    edges,
    isReady: isAutosaveReady,
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
      <AiStatusBridge />
      <CanvasFlow {...flowProps} />
    </ReactFlowProvider>
  );
}

export default function ClientCanvas({ roomId }: ClientCanvasProps) {
  return (
    <SimpleErrorBoundary fallback={<div className="p-4">Canvas error</div>}>
      <ClientSideSuspense
        fallback={
          <div className="h-full w-full flex items-center justify-center">
            Connecting…
          </div>
        }
      >
        <CanvasInner projectId={roomId} />
      </ClientSideSuspense>
    </SimpleErrorBoundary>
  );
}
