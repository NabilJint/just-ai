"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

interface CanvasStateValue {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  setCanvasState: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
}

const CanvasStateContext = createContext<CanvasStateValue>({
  nodes: [],
  edges: [],
  setCanvasState: () => {},
});

export function CanvasStateProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);

  const setCanvasState = useCallback(
    (nextNodes: CanvasNode[], nextEdges: CanvasEdge[]) => {
      setNodes(nextNodes);
      setEdges(nextEdges);
    },
    [],
  );

  return (
    <CanvasStateContext.Provider value={{ nodes, edges, setCanvasState }}>
      {children}
    </CanvasStateContext.Provider>
  );
}

/** Read the live canvas nodes/edges published by CanvasInner. */
export function useCanvasState() {
  return useContext(CanvasStateContext);
}
