"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
  useNodes,
  type EdgeProps,
} from "@xyflow/react";
import type { CanvasEdge } from "@/types/canvas";

function getAdaptiveLabelOffset(
  labelX: number,
  labelY: number,
  nodes: Array<{ position?: { x: number; y: number }; width?: number; height?: number }>,
  labelWidth = 80,
  labelHeight = 20,
): { x: number; y: number } {
  const PAD = 4;

  function intersectsNode(x: number, y: number): boolean {
    const lx = x - labelWidth / 2 - PAD;
    const ly = y - labelHeight / 2 - PAD;
    const lw = labelWidth + PAD * 2;
    const lh = labelHeight + PAD * 2;
    for (const node of nodes) {
      if (node.position == null || node.width == null || node.height == null) continue;
      if (
        lx < node.position.x + node.width &&
        lx + lw > node.position.x &&
        ly < node.position.y + node.height &&
        ly + lh > node.position.y
      ) {
        return true;
      }
    }
    return false;
  }

  // Default: centered on the edge path
  if (!intersectsNode(labelX, labelY)) {
    return { x: 0, y: 0 };
  }

  // Collision: try downward first
  const DOWNWARD = 18;
  if (!intersectsNode(labelX, labelY + DOWNWARD)) {
    return { x: 0, y: DOWNWARD };
  }

  // Fallback: upward
  const UPWARD = -18;
  if (!intersectsNode(labelX, labelY + UPWARD)) {
    return { x: 0, y: UPWARD };
  }

  // Both blocked: use downward anyway
  return { x: 0, y: DOWNWARD };
}

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { setEdges } = useReactFlow<never, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const label = data?.label;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const nodes = useNodes();
  const CHIP_PAD = 10;
  const CHIP_HEIGHT = 20;
  const CHAR_W = 6.5;
  const labelWidth = isEditing
    ? Math.max(72, (draft.length + 2) * 7)
    : label
      ? label.length * CHAR_W + CHIP_PAD * 2
      : 92;
  const { x: labelOffsetX, y: labelOffsetY } = getAdaptiveLabelOffset(
    labelX, labelY,
    nodes,
    labelWidth,
    CHIP_HEIGHT,
  );

  const isActive = selected || isHovered;
  const strokeColor = isActive ? "var(--accent-primary)" : "rgba(255,255,255,0.28)";

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const openEditing = useCallback(() => {
    setDraft(label ?? "");
    setIsEditing(true);
  }, [label]);

  const commitEdit = useCallback(() => {
    const trimmed = draft.trim();
    setEdges((edges) =>
      edges.map((e) => {
        if (e.id === id) {
          return { ...e, data: { ...(e.data ?? {}), label: trimmed } };
        }
        return e;
      })
    );
    setIsEditing(false);
  }, [draft, id, setEdges]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
      else if (e.key === "Escape") { e.preventDefault(); setIsEditing(false); }
    },
    [commitEdit]
  );

  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openEditing();
  }, [openEditing]);

  return (
    <>
      {/* Wide invisible hit area — no visible thickness increase */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={(e) => { e.stopPropagation(); openEditing(); }}
        style={{ cursor: "pointer" }}
      />

      {/*
       * markerEnd comes from React Flow's defaultEdgeOptions — it is
       * already the processed "url(#…)" string with correct orientation.
       * Passing it through here keeps React Flow's built-in marker
       * geometry intact (correct direction, correct auto-orient).
       */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: isActive ? 2 : 1.5,
          transition: "stroke 0.15s ease, stroke-width 0.15s ease",
          strokeLinecap: "round",
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX + labelOffsetX}px, ${labelY + labelOffsetY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Add label…"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--accent-primary)",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontSize: "11px",
                fontFamily: "inherit",
                outline: "none",
                minWidth: "72px",
                width: `${Math.max(72, (draft.length + 2) * 7)}px`,
                textAlign: "center",
                boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent)",
              }}
            />
          ) : label ? (
            <span
              onDoubleClick={handleLabelDoubleClick}
              style={{
                display: "inline-block",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: `1px solid ${isActive ? "var(--accent-primary)" : "var(--border-default)"}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontSize: "11px",
                cursor: "pointer",
                userSelect: "none",
                transition: "border-color 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          ) : (
            <span
              onDoubleClick={handleLabelDoubleClick}
              style={{
                display: "inline-block",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                border: `1px dashed ${isActive ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontSize: "11px",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              Enter label...
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
