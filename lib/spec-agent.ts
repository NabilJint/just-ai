import { z } from "zod";

export const specTriggerSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  nodes: z.array(z.record(z.string(), z.unknown())),
  edges: z.array(z.record(z.string(), z.unknown())),
});

export const specTokenSchema = z.object({
  runId: z.string().min(1, "runId is required"),
});

export type SpecTriggerInput = z.infer<typeof specTriggerSchema>;
export type SpecTokenInput = z.infer<typeof specTokenSchema>;

export interface SpecTaskPayload {
  projectId: string;
  roomId: string;
  chatHistory: { role: "user" | "assistant"; content: string }[];
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
}
