import {
  task
} from "../../../chunk-IL4ENQNW.mjs";
import "../../../chunk-YE7P35PB.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-JN2GKVDO.mjs";

// trigger/example.ts
init_esm();
var helloWorldTask = task({
  id: "hello-world",
  run: /* @__PURE__ */ __name(async (payload) => {
    const msg = payload.message ?? "Hello from Trigger.dev!";
    console.log(msg);
    return { greeting: msg };
  }, "run")
});
export {
  helloWorldTask
};
//# sourceMappingURL=example.mjs.map
