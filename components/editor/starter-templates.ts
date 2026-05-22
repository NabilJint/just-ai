import {
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
  NODE_COLORS,
  DEFAULT_NODE_COLOR,
} from "@/types/canvas";
import { generateNodeId } from "@/lib/node-id";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function createNode(
  id: string,
  shape: CanvasNodeShape,
  label: string,
  x: number,
  y: number,
  width = 160,
  height = 90
): CanvasNode {
  // Circles usually have equal width and height
  if (shape === "circle" && width === 160 && height === 90) {
    width = 112;
    height = 112;
  }

  return {
    id,
    type: shape,
    position: { x, y },
    width,
    height,
    data: {
      label,
      color: NODE_COLORS[shape] ?? DEFAULT_NODE_COLOR,
      shape,
      size: { width, height },
    },
  };
}

function createEdge(id: string, source: string, target: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label: "" },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard setup with an API gateway routing to independent services and databases.",
    nodes: [
      createNode("gateway", "hexagon", "API Gateway", 300, 100),
      createNode("auth-service", "rectangle", "Auth Service", 100, 300),
      createNode("user-service", "rectangle", "User Service", 300, 300),
      createNode("order-service", "rectangle", "Order Service", 500, 300),
      createNode("auth-db", "cylinder", "Auth DB", 100, 500),
      createNode("user-db", "cylinder", "User DB", 300, 500),
      createNode("order-db", "cylinder", "Order DB", 500, 500),
    ],
    edges: [
      createEdge("e1", "gateway", "auth-service"),
      createEdge("e2", "gateway", "user-service"),
      createEdge("e3", "gateway", "order-service"),
      createEdge("e4", "auth-service", "auth-db"),
      createEdge("e5", "user-service", "user-db"),
      createEdge("e6", "order-service", "order-db"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A continuous integration and deployment flow from code commit to production.",
    nodes: [
      createNode("commit", "circle", "Git Commit", 100, 200),
      createNode("build", "rectangle", "Build Docker Image", 300, 200),
      createNode("test", "diamond", "Run Tests", 500, 200),
      createNode("registry", "cylinder", "Image Registry", 300, 400),
      createNode("deploy", "hexagon", "Deploy to Prod", 700, 200),
    ],
    edges: [
      createEdge("e1", "commit", "build"),
      createEdge("e2", "build", "test"),
      createEdge("e3", "build", "registry"),
      createEdge("e4", "test", "deploy"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "An asynchronous architecture using an event bus to decouple producers and consumers.",
    nodes: [
      createNode("producer-1", "rectangle", "Web App (Producer)", 100, 150),
      createNode("producer-2", "rectangle", "Mobile App (Producer)", 100, 350),
      createNode("event-bus", "pill", "Event Bus (Kafka / SQS)", 350, 250, 200, 60),
      createNode("consumer-1", "rectangle", "Notification Service", 650, 150),
      createNode("consumer-2", "rectangle", "Analytics Service", 650, 350),
      createNode("db", "cylinder", "Data Warehouse", 850, 350),
    ],
    edges: [
      createEdge("e1", "producer-1", "event-bus"),
      createEdge("e2", "producer-2", "event-bus"),
      createEdge("e3", "event-bus", "consumer-1"),
      createEdge("e4", "event-bus", "consumer-2"),
      createEdge("e5", "consumer-2", "db"),
    ],
  },
];
