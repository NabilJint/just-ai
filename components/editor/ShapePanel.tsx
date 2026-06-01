"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShapePreview } from "./nodes/CanvasShapeNodes";
import type { CanvasNodeShape, CanvasNodeSize } from "@/types/canvas";

const SHAPES: {
  key: CanvasNodeShape;
  label: string;
  size: CanvasNodeSize;
  previewSize: CanvasNodeSize;
}[] = [
  {
    key: "rectangle",
    label: "Rectangle",
    size: { width: 160, height: 90 },
    previewSize: { width: 32, height: 22 },
  },
  {
    key: "diamond",
    label: "Diamond",
    size: { width: 148, height: 148 },
    // Diamond uses 13% inset, so 38×38 container = ~28×28 visual
    previewSize: { width: 38, height: 38 },
  },
  {
    key: "circle",
    label: "Circle",
    size: { width: 112, height: 112 },
    previewSize: { width: 28, height: 28 },
  },
  {
    key: "pill",
    label: "Pill",
    size: { width: 180, height: 80 },
    previewSize: { width: 36, height: 20 },
  },
  {
    key: "cylinder",
    label: "Cylinder",
    size: { width: 144, height: 104 },
    previewSize: { width: 28, height: 24 },
    // previewSize: { width: 38, height: 14 },
  },
  {
    key: "hexagon",
    label: "Hexagon",
    size: { width: 148, height: 120 },
    previewSize: { width: 30, height: 26 },
  },
];

export default function ShapePanel() {
  function onDragStart(
    e: React.DragEvent,
    shapeKey: CanvasNodeShape,
    size: CanvasNodeSize,
  ) {
    const payload = { shape: shapeKey, size };
    e.dataTransfer.setData("application/reactflow", shapeKey);
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated/90 px-3 py-2 backdrop-blur-sm">
        {SHAPES.map((s) => (
          <Button
            key={s.key}
            variant="ghost"
            size="icon"
            draggable
            onDragStart={(e) => onDragStart(e, s.key, s.size)}
            className="size-11 rounded-xl border border-border bg-bg-base/60 hover:border-border-subtle hover:bg-bg-subtle"
            title={s.label}
            aria-label={`Add ${s.label}`}
          >
            <ShapePreview shape={s.key} size={s.previewSize} />
          </Button>
        ))}
      </div>
    </div>
  );
}
