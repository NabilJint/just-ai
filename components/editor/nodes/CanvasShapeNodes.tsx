"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, useReactFlow, type NodeProps } from "@xyflow/react";
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
  isEditing?: boolean;
  onLabelChange?: (val: string) => void;
  onEditingClose?: () => void;
}

function getShapeColor(shape: CanvasNodeShape, color?: CanvasNodeColor) {
  return color ?? NODE_COLORS[shape] ?? DEFAULT_NODE_COLOR;
}

function ShapeLabel({
  label,
  color,
  isEditing = false,
  onLabelChange,
  onEditingClose,
}: {
  label?: string;
  color: CanvasNodeColor;
  isEditing?: boolean;
  onLabelChange?: (val: string) => void;
  onEditingClose?: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-focus and place cursor at the end when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEditingClose?.();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        textareaRef.current?.blur();
      }
    },
    [onEditingClose]
  );

  const handleBlur = useCallback(() => {
    onEditingClose?.();
  }, [onEditingClose]);

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={label ?? ""}
        onChange={(e) => onLabelChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={2}
        className="nodrag nopan absolute inset-x-3 top-1/2 -translate-y-1/2 w-[calc(100%-24px)] bg-transparent border-none outline-none resize-none text-center text-xs font-medium focus:ring-0 focus:outline-none p-0 m-0 overflow-hidden leading-tight"
        style={{ color: color.text }}
        placeholder="Enter label..."
      />
    );
  }

  const isPlaceholder = !label;
  const displayText = label || "Double-click to edit";

  return (
    <span
      className={`absolute inset-x-3 top-1/2 -translate-y-1/2 text-center text-xs font-medium leading-tight select-none pointer-events-none line-clamp-3 ${
        isPlaceholder ? "opacity-35 italic" : ""
      }`}
      style={{ color: color.text }}
    >
      {displayText}
    </span>
  );
}

export function ShapeBody({
  shape,
  size,
  color,
  label,
  compact = false,
  isEditing = false,
  onLabelChange,
  onEditingClose,
}: ShapeBodyProps) {
  const labelText = compact ? undefined : label;
  const style = {
    width: size.width,
    height: size.height,
    color: color.text,
  };

  const renderLabel = () => {
    if (compact) return null;
    return (
      <ShapeLabel
        label={labelText}
        color={color}
        isEditing={isEditing}
        onLabelChange={onLabelChange}
        onEditingClose={onEditingClose}
      />
    );
  };

  if (shape === "diamond") {
    return (
      <div className="relative" style={style}>
        <div
          className="absolute inset-[13%] rotate-45 border"
          style={{ background: color.fill, borderColor: color.stroke }}
        />
        {renderLabel()}
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
        {renderLabel()}
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
        {renderLabel()}
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
        {renderLabel()}
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
        {renderLabel()}
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
      {renderLabel()}
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

export function CanvasShapeNode(props: NodeProps<CanvasNode>) {
  const { type, data, selected, id } = props;
  const nodeType = type ?? "";
  const shape: CanvasNodeShape = isCanvasNodeShape(nodeType)
    ? nodeType
    : data.shape ?? "rectangle";

  // Use measured width/height from props if present, fallback to data.size
  const width = props.width ?? data.size?.width ?? (shape === "circle" ? 112 : 160);
  const height = props.height ?? data.size?.height ?? (shape === "circle" ? 112 : 90);
  const size = { width, height };
  const color = getShapeColor(shape, data.color);

  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);

  // Resize end handler to sync back the new dimensions to data.size and node width/height
  const handleResizeEnd = useCallback(
    (_event: any, params: { width: number; height: number }) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              width: params.width,
              height: params.height,
              data: {
                ...node.data,
                size: {
                  width: params.width,
                  height: params.height,
                },
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  // Label change handler
  const handleLabelChange = useCallback(
    (newLabel: string) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  return (
    <div className="group relative" onDoubleClick={handleDoubleClick}>
      <NodeResizer
        isVisible={selected}
        minWidth={shape === "circle" ? 60 : 80}
        minHeight={shape === "circle" ? 60 : 40}
        onResizeEnd={handleResizeEnd}
        handleClassName="h-2 w-2 bg-bg-surface border border-border-subtle rounded-sm hover:border-accent-primary hover:bg-accent-primary transition-colors"
        lineClassName="border-accent-primary/40 border-dashed"
      />
      <ShapeBody
        shape={shape}
        size={size}
        color={color}
        label={data.label}
        isEditing={isEditing}
        onLabelChange={handleLabelChange}
        onEditingClose={() => setIsEditing(false)}
      />
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
