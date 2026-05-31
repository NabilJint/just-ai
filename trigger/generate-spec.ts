import { logger, metadata, task } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const generateSpecPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  nodes: z.array(z.record(z.string(), z.unknown())),
  edges: z.array(z.record(z.string(), z.unknown())),
});

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;

// --------------------------------------------------------------------------
// Canvas extraction helpers
// --------------------------------------------------------------------------

interface ExtractedNode {
  id: string;
  label: string;
  type: string;
  shape: string;
}

interface ExtractedEdge {
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
  label: string;
}

function extractNodes(nodes: Record<string, unknown>[]): ExtractedNode[] {
  return nodes.map((node) => {
    const data = node.data as Record<string, unknown> | undefined;
    return {
      id: String(node.id ?? ""),
      label: String(data?.label ?? "Unnamed Component"),
      type: String(node.type ?? "shape"),
      shape: String(data?.shape ?? "rectangle"),
    };
  });
}

function extractEdges(
  edges: Record<string, unknown>[],
  nodeMap: Map<string, string>,
): ExtractedEdge[] {
  return edges.map((edge) => {
    const sourceId = String(edge.source ?? "");
    const targetId = String(edge.target ?? "");
    return {
      sourceId,
      sourceLabel: nodeMap.get(sourceId) ?? sourceId,
      targetId,
      targetLabel: nodeMap.get(targetId) ?? targetId,
      label: String(edge.label ?? ""),
    };
  });
}

// --------------------------------------------------------------------------
// Architecture description builder
// --------------------------------------------------------------------------

function buildArchitectureDescription(
  nodes: ExtractedNode[],
  edges: ExtractedEdge[],
): string {
  const nodeList = nodes.map((n) => `- ${n.label} (${n.shape})`).join("\n");

  const edgeList = edges
    .map((e) => {
      const via = e.label ? ` [via: ${e.label}]` : "";
      return `- ${e.sourceLabel} → ${e.targetLabel}${via}`;
    })
    .join("\n");

  const parts: string[] = [
    "## Architecture Diagram",
    "",
    "### Components",
    nodeList || "  (no components defined)",
    "",
    "### Connections",
    edgeList || "  (no connections defined)",
  ];

  return parts.join("\n");
}

// --------------------------------------------------------------------------
// Prompt builder
// --------------------------------------------------------------------------

function buildSpecPrompt(
  architectureDescription: string,
  chatSummary: string,
): string {
  const sections = [
    "You are generating a technical architecture specification from a system design diagram.",
    "",
    "Below is the exact architecture captured from the canvas. Each component name and connection",
    "reflects what the designer placed on the diagram. Your specification MUST use these exact",
    "component names and connections — do not invent or rename any components.",
    "",
    "---",
    "",
    architectureDescription,
    "",
    "---",
    "",
    chatSummary ? `## Design Context\n\n${chatSummary}\n\n---\n` : "",
    "## Required Output",
    "",
    "Generate a complete, thorough technical specification in Markdown covering all of the following",
    "sections. Use the exact component names from the diagram throughout.",
    "",
    "1. **Executive Summary** — What system is this and what problem does it solve?",
    "2. **Architecture Overview** — High-level description of the system structure and design patterns.",
    "3. **Component Responsibilities** — For each component listed above, describe its role, inputs, and outputs.",
    "4. **Data Flow** — Step-by-step description of how data moves through the system, referencing the connections.",
    "5. **API Design** — Key interfaces, protocols, and contracts between components.",
    "6. **Security Considerations** — Auth, authorization, data protection, and threat model.",
    "7. **Scalability Strategy** — How the system handles load growth; bottlenecks and mitigation.",
    "8. **Infrastructure Requirements** — Hosting, deployment topology, environment dependencies.",
    "9. **Monitoring & Observability** — Logging, metrics, alerting, and tracing strategy.",
    "10. **Risks & Recommendations** — Known risks, open questions, and suggested next steps.",
    "",
    "Write clearly and professionally. Use markdown headings, tables, and code blocks as appropriate.",
    "Be thorough — this document will serve as the primary technical reference for the team.",
  ];

  return sections.join("\n");
}

function summarizeChat(
  chatHistory: { role: "user" | "assistant"; content: string }[],
): string {
  if (chatHistory.length === 0) return "";
  return chatHistory
    .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");
}

// --------------------------------------------------------------------------
// Task
// --------------------------------------------------------------------------

export const generateSpecTask = task({
  id: "generate-spec",
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
  },
  run: async (payload: GenerateSpecPayload, { ctx }) => {
    logger.info("Spec generation started", {
      roomId: payload.roomId,
      projectId: payload.projectId,
      nodeCount: payload.nodes.length,
      edgeCount: payload.edges.length,
      chatLength: payload.chatHistory.length,
    });

    metadata.set("status", "starting").set("progress", 0);

    const reportStatus = async (phase: string, message: string) => {
      metadata.set("status", phase).append("logs", message);
    };

    // Validate canvas is not empty
    if (payload.nodes.length === 0) {
      throw new Error(
        "Cannot generate specification from an empty canvas. Add components to the diagram first.",
      );
    }

    try {
      await reportStatus("processing", "Extracting canvas architecture…");
      metadata.set("progress", 20);

      const extractedNodes = extractNodes(payload.nodes);
      const nodeMap = new Map(extractedNodes.map((n) => [n.id, n.label]));
      const extractedEdges = extractEdges(payload.edges, nodeMap);

      const architectureDescription = buildArchitectureDescription(
        extractedNodes,
        extractedEdges,
      );

      const chatSummary = summarizeChat(payload.chatHistory);

      logger.info("Architecture extracted", {
        components: extractedNodes.map((n) => n.label),
        connectionCount: extractedEdges.length,
      });

      const apiKey = process.env.GOOGLE_AI_API_KEY;

      if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY is not configured");
      }

      await reportStatus("processing", "Generating specification with AI…");
      metadata.set("progress", 50);

      const google = createGoogleGenerativeAI({ apiKey });

      const system = [
        "You are a senior software architect writing formal technical specifications.",
        "Your output is always well-structured Markdown, professional in tone, and technically precise.",
        "You ground every claim in the architecture diagram provided — you never invent components or connections.",
        "You use the exact names from the diagram throughout your specification.",
      ].join("\n");

      const prompt = buildSpecPrompt(architectureDescription, chatSummary);

      const result = await generateText({
        model: google("gemini-3.5-flash"),
        system,
        prompt,
      });

      const spec = result.text;

      const specId = crypto.randomUUID();

      await reportStatus("processing", "Uploading specification to storage…");
      metadata.set("progress", 85);

      const blob = await put(
        `specs/${payload.projectId}/${specId}.md`,
        spec,
        {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: false,
          contentType: "text/markdown",
        },
      );

      await prisma.projectSpec.create({
        data: {
          id: specId,
          projectId: payload.projectId,
          filePath: blob.url,
          content: spec,
        },
      });

      metadata.set("progress", 100);
      await reportStatus("complete", "Specification generation complete.");

      return { spec, roomId: payload.roomId, specId, filePath: blob.url };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Spec generation failed";

      logger.error("Spec generation failed", {
        error: message,
        roomId: payload.roomId,
      });

      metadata.set("progress", 0).set("status", "error");

      throw error;
    }
  },
});
