"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  DEFAULT_NODE_COLOR,
  isCanvasNodeShape,
  NODE_COLORS,
  type CanvasNode,
  type CanvasNodeColor,
  type CanvasNodeShape,
  type CanvasNodeSize,
} from "@/types/canvas";

const HANDLE_CLASS =
  "h-2.5 w-2.5 border border-bg-base bg-text-primary opacity-0 transition-opacity group-hover:opacity-100";

interface ShapeBodyProps {
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
  color: CanvasNodeColor;
  label?: string;
  compact?: boolean;
}

function getShapeColor(shape: CanvasNodeShape, color?: CanvasNodeColor) {
  return color ?? NODE_COLORS[shape] ?? DEFAULT_NODE_COLOR;
}

function ShapeLabel({ label, color }: { label?: string; color: CanvasNodeColor }) {
  if (!label) {
    return null;
  }

  return (
    <span
      className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 truncate text-center text-xs font-medium"
      style={{ color: color.text }}
    >
      {label}
    </span>
  );
}

export function ShapeBody({
  shape,
  size,
  color,
  label,
  compact = false,
}: ShapeBodyProps) {
  const labelText = compact ? undefined : label;
  const style = {
    width: size.width,
    height: size.height,
    color: color.text,
  };

  if (shape === "diamond") {
    return (
      <div className="relative" style={style}>
        <div
          className="absolute inset-[13%] rotate-45 border"
          style={{ background: color.fill, borderColor: color.stroke }}
        />
        <ShapeLabel label={labelText} color={color} />
      </div>
    );
  }

  if (shape === "circle") {
    return (
      <div
        className="relative rounded-full border"
        style={{
          ...style,
          background: color.fill,
          borderColor: color.stroke,
        }}
      >
        <ShapeLabel label={labelText} color={color} />
      </div>
    );
  }

  if (shape === "pill") {
    return (
      <div
        className="relative rounded-full border"
        style={{
          ...style,
          background: color.fill,
          borderColor: color.stroke,
        }}
      >
        <ShapeLabel label={labelText} color={color} />
      </div>
    );
  }

  if (shape === "cylinder") {
    const ellipseHeight = Math.max(12, Math.min(24, size.height * 0.22));

    return (
      <div className="relative" style={style}>
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${size.width} ${size.height}`}
          role="img"
          aria-hidden="true"
        >
          <path
            d={`M1 ${ellipseHeight / 2} C1 ${ellipseHeight * 0.12} ${
              size.width - 1
            } ${ellipseHeight * 0.12} ${size.width - 1} ${
              ellipseHeight / 2
            } V${size.height - ellipseHeight / 2} C${size.width - 1} ${
              size.height - ellipseHeight * 0.12
            } 1 ${size.height - ellipseHeight * 0.12} 1 ${
              size.height - ellipseHeight / 2
            } Z`}
            fill={color.fill}
            stroke={color.stroke}
            strokeWidth="1"
          />
          <ellipse
            cx={size.width / 2}
            cy={ellipseHeight / 2}
            rx={size.width / 2 - 1}
            ry={ellipseHeight / 2}
            fill={color.fill}
            stroke={color.stroke}
            strokeWidth="1"
          />
          <path
            d={`M1 ${size.height - ellipseHeight / 2} C1 ${
              size.height - ellipseHeight * 0.12
            } ${size.width - 1} ${size.height - ellipseHeight * 0.12} ${
              size.width - 1
            } ${size.height - ellipseHeight / 2}`}
            fill="none"
            stroke={color.stroke}
            strokeWidth="1"
          />
        </svg>
        <ShapeLabel label={labelText} color={color} />
      </div>
    );
  }

  if (shape === "hexagon") {
    return (
      <div className="relative" style={style}>
        <div
          className="absolute inset-0 border"
          style={{
            background: color.fill,
            borderColor: color.stroke,
            clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
          }}
        />
        <ShapeLabel label={labelText} color={color} />
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl border"
      style={{
        ...style,
        background: color.fill,
        borderColor: color.stroke,
      }}
    >
      <ShapeLabel label={labelText} color={color} />
    </div>
  );
}

export function ShapePreview({
  shape,
  size,
}: {
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
}) {
  const color = getShapeColor(shape);
  return <ShapeBody shape={shape} size={size} color={color} compact />;
}

export function CanvasShapeNode({ type, data }: NodeProps<CanvasNode>) {
  const nodeType = type ?? "";
  const shape: CanvasNodeShape = isCanvasNodeShape(nodeType)
    ? nodeType
    : data.shape ?? "rectangle";
  const size = data.size ?? { width: 160, height: 90 };
  const color = getShapeColor(shape, data.color);

  return (
    <div className="group relative">
      <ShapeBody shape={shape} size={size} color={color} label={data.label} />
      <Handle id="source-top" type="source" position={Position.Top} className={HANDLE_CLASS} />
      <Handle id="source-right" type="source" position={Position.Right} className={HANDLE_CLASS} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle id="source-left" type="source" position={Position.Left} className={HANDLE_CLASS} />
      <Handle id="target-top" type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle id="target-right" type="target" position={Position.Right} className={HANDLE_CLASS} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle id="target-left" type="target" position={Position.Left} className={HANDLE_CLASS} />
    </div>
  );
}
