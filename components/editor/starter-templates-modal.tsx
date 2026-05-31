import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";
import { type CanvasNode, type CanvasNodeColor } from "@/types/canvas";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { viewBox, scaledNodes, scaledEdges } = useMemo(() => {
    if (template.nodes.length === 0) {
      return { viewBox: "0 0 100 100", scaledNodes: [], scaledEdges: [] };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    template.nodes.forEach((node) => {
      const w = node.width ?? 160;
      const h = node.height ?? 90;
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + w);
      maxY = Math.max(maxY, node.position.y + h);
    });

    const padding = 60;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const vb = `${minX - padding} ${minY - padding} ${width} ${height}`;

    const getNodeCenter = (nodeId: string) => {
      const node = template.nodes.find((n) => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };
      const w = node.width ?? 160;
      const h = node.height ?? 90;
      return {
        x: node.position.x + w / 2,
        y: node.position.y + h / 2,
      };
    };

    const edges = template.edges.map((edge) => {
      const source = getNodeCenter(edge.source);
      const target = getNodeCenter(edge.target);
      return { id: edge.id, source, target };
    });

    return { viewBox: vb, scaledNodes: template.nodes, scaledEdges: edges };
  }, [template]);

  return (
    <div className="w-full h-1/2 bg-bg-base/50 rounded-md border border-border overflow-hidden mb-4 relative">
      <svg
        viewBox={viewBox}
        className="w-full h-full text-text-secondary"
        preserveAspectRatio="xMidYMid meet"
      >
        {scaledEdges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.source.x}
            y1={edge.source.y}
            x2={edge.target.x}
            y2={edge.target.y}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}

        {scaledNodes.map((node) => {
          const w = node.width ?? 160;
          const h = node.height ?? 90;
          const cx = node.position.x + w / 2;
          const cy = node.position.y + h / 2;
          const color = (node.data.color as CanvasNodeColor) || {
            fill: "var(--bg-surface)",
            stroke: "var(--accent-primary)",
          };
          const shape = node.type;

          let shapeElement;

          switch (shape) {
            case "circle":
              shapeElement = <circle cx={cx} cy={cy} r={w / 2} />;
              break;
            case "pill":
              shapeElement = (
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width={w}
                  height={h}
                  rx={h / 2}
                  ry={h / 2}
                />
              );
              break;
            case "diamond":
              shapeElement = (
                <polygon
                  points={`${cx},${node.position.y} ${node.position.x + w},${cy} ${cx},${node.position.y + h} ${node.position.x},${cy}`}
                />
              );
              break;
            case "hexagon":
              const quarterW = w / 4;
              shapeElement = (
                <polygon
                  points={`${node.position.x + quarterW},${node.position.y} ${node.position.x + w - quarterW},${node.position.y} ${node.position.x + w},${cy} ${node.position.x + w - quarterW},${node.position.y + h} ${node.position.x + quarterW},${node.position.y + h} ${node.position.x},${cy}`}
                />
              );
              break;
            case "cylinder":
              // Simplified cylinder for preview
              shapeElement = (
                <g>
                  <rect
                    x={node.position.x}
                    y={node.position.y + h * 0.15}
                    width={w}
                    height={h * 0.7}
                  />
                  <ellipse
                    cx={cx}
                    cy={node.position.y + h * 0.15}
                    rx={w / 2}
                    ry={h * 0.15}
                  />
                  <ellipse
                    cx={cx}
                    cy={node.position.y + h - h * 0.15}
                    rx={w / 2}
                    ry={h * 0.15}
                  />
                </g>
              );
              break;
            case "rectangle":
            default:
              shapeElement = (
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width={w}
                  height={h}
                  rx={8}
                  ry={8}
                />
              );
              break;
          }

          return (
            <g
              key={node.id}
              fill={color.fill}
              stroke={color.stroke}
              strokeWidth={2}
            >
              {shapeElement}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[90vw]  flex flex-col p-0 overflow-hidden bg-bg-elevated border-border">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-medium tracking-tight text-text-primary">
            Starter Templates
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Choose a diagram template to get started quickly. Importing a
            template will replace your current canvas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {CANVAS_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col border-border p-4 hover:border-accent-primary/50 transition-colors duration-200 rounded-xl"
              >
                <TemplatePreview template={template} />

                <h3 className="font-semibold text-text-primary text-base mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                  {template.description}
                </p>

                <Button
                  onClick={() => onImport(template)}
                  variant="outline"
                  className="w-full mt-auto hover:bg-accent-primary hover:text-bg-base border-border transition-colors"
                >
                  Import Template
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
