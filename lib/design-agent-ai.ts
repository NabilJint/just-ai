import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { CanvasSnapshot } from "@/lib/canvas-snapshot";
import {
  extractJsonFromModelText,
  getDesignConstraintsPrompt,
  parseDesignPlan,
  type DesignPlan,
} from "@/lib/design-agent-actions";

function summarizeCanvas(snapshot: CanvasSnapshot): string {
  if (snapshot.nodes.length === 0 && snapshot.edges.length === 0) {
    return "The canvas is empty.";
  }

  const nodeLines = snapshot.nodes.map(
    (node) =>
      `- ${node.id} (${node.type ?? "node"}): "${node.data?.label ?? ""}" at (${Math.round(node.position.x)}, ${Math.round(node.position.y)})`,
  );

  const edgeLines = snapshot.edges.map(
    (edge) => `- ${edge.id}: ${edge.source} -> ${edge.target}`,
  );

  return ["Nodes:", ...nodeLines, "Edges:", ...edgeLines].join("\n");
}

export async function generateDesignPlan(
  prompt: string,
  snapshot: CanvasSnapshot,
): Promise<DesignPlan> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  const system = [
    "You are Ghost AI, a system design assistant.",
    "Respond with JSON only — no markdown prose outside the JSON object.",
    'Schema: { "actions": [ ... ] } where each action has a "type" field.',
    "Supported action types:",
    '- addNode: { type, tempId?, shape, label?, x, y, width?, height?, paletteIndex? }',
    '- moveNode: { type, id, x, y }',
    '- resizeNode: { type, id, width, height }',
    '- updateNodeData: { type, id, label?, paletteIndex?, shape? }',
    '- deleteNode: { type, id }',
    '- addEdge: { type, tempId?, source, target, label? }',
    '- deleteEdge: { type, id }',
    getDesignConstraintsPrompt(),
  ].join("\n");

  const google = createGoogleGenerativeAI({ apiKey });

  const result = await generateText({
    model: google("gemini-3.5-flash"),
    system,
    prompt: [
      `User request: ${prompt}`,
      "",
      "Current canvas:",
      summarizeCanvas(snapshot),
    ].join("\n"),
  });

  const parsed = parseDesignPlan(extractJsonFromModelText(result.text));

  if (!parsed) {
    throw new Error("AI returned no valid design actions");
  }

  return parsed;
}
