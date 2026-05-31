import {
  task
} from "../../../chunk-AT67HVRV.mjs";
import "../../../chunk-7JDNMTFL.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-FUV6SSYK.mjs";

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
