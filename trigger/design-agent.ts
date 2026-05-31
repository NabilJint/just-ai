import { logger, metadata, task } from "@trigger.dev/sdk";
import { applyDesignActions, getCanvasSnapshotFromRoom } from "@/lib/canvas-flow";
import { generateDesignPlan } from "@/lib/design-agent-ai";
import {
  clearAiPresence,
  publishAiStatus,
  setAiPresence,
} from "@/lib/design-agent-liveblocks";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
  runId?: string;
}

export const designAgentTask = task({
  id: "design-agent",
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
  },
  run: async (payload: DesignAgentPayload, { ctx }) => {
    const runId = payload.runId ?? ctx.run.id;

    logger.info("Design agent started", {
      roomId: payload.roomId,
      prompt: payload.prompt,
      runId,
    });

    metadata.set("status", "starting").set("progress", 0);

    const reportStatus = async (
      phase: "start" | "processing" | "complete" | "error",
      message: string,
    ) => {
      metadata.set("status", phase).append("logs", message);
      await publishAiStatus(payload.roomId, phase, message, runId);
    };

    try {
      await reportStatus("start", "Ghost AI is analyzing your request…");
      await setAiPresence(payload.roomId, {
        cursor: { x: 400, y: 300 },
        isThinking: true,
      });

      await reportStatus("processing", "Reading the current canvas…");
      const snapshot = await getCanvasSnapshotFromRoom(payload.roomId);

      await setAiPresence(payload.roomId, {
        cursor: { x: 520, y: 360 },
        isThinking: true,
      });

      await reportStatus("processing", "Generating architecture with Gemini…");
      metadata.set("progress", 35);

      const plan = await generateDesignPlan(payload.prompt, snapshot);

      await setAiPresence(payload.roomId, {
        cursor: { x: 640, y: 420 },
        isThinking: true,
      });

      await reportStatus(
        "processing",
        `Applying ${plan.actions.length} canvas updates…`,
      );
      metadata.set("progress", 70);

      const { applied } = await applyDesignActions(payload.roomId, plan.actions);

      metadata.set("progress", 100);
      await reportStatus(
        "complete",
        `Design complete — applied ${applied} update${applied === 1 ? "" : "s"}.`,
      );

      await clearAiPresence(payload.roomId);

      return {
        roomId: payload.roomId,
        applied,
        actionCount: plan.actions.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Design generation failed";

      logger.error("Design agent failed", { error: message, roomId: payload.roomId });

      metadata.set("progress", 0).set("status", "error");

      try {
        await reportStatus("error", message);
        await clearAiPresence(payload.roomId);
      } catch (cleanupError) {
        logger.error("Failed to publish error status", { cleanupError });
      }

      throw error;
    }
  },
});
