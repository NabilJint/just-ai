import {
  logger,
  task
} from "../../../chunk-AT67HVRV.mjs";
import "../../../chunk-7JDNMTFL.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-FUV6SSYK.mjs";

// trigger/design-agent.ts
init_esm();
var designAgentTask = task({
  id: "design-agent",
  run: /* @__PURE__ */ __name(async (payload) => {
    logger.info("Design agent received prompt", {
      roomId: payload.roomId,
      prompt: payload.prompt
    });
    return {
      echoed: payload.prompt,
      roomId: payload.roomId
    };
  }, "run")
});
export {
  designAgentTask
};
//# sourceMappingURL=design-agent.mjs.map
