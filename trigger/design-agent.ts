import { logger, task } from "@trigger.dev/sdk";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    logger.info("Design agent received prompt", {
      roomId: payload.roomId,
      prompt: payload.prompt,
    });

    return {
      echoed: payload.prompt,
      roomId: payload.roomId,
    };
  },
});
