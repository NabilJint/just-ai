import {
  __commonJS,
  __require,
  init_esm
} from "./chunk-JN2GKVDO.mjs";

// ../../Library/Caches/pnpm/dlx/886e157b61cdcb21f1e5048f3649e59a7fcfc579327ce6a4d853a479cb024479/19e5ab07da7-11ccb/node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/execAsync.js
var require_execAsync = __commonJS({
  "../../Library/Caches/pnpm/dlx/886e157b61cdcb21f1e5048f3649e59a7fcfc579327ce6a4d853a479cb024479/19e5ab07da7-11ccb/node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/execAsync.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execAsync = void 0;
    var child_process = __require("child_process");
    var util = __require("util");
    exports.execAsync = util.promisify(child_process.exec);
  }
});

export {
  require_execAsync
};
//# sourceMappingURL=chunk-6RXPCIHM.mjs.map
