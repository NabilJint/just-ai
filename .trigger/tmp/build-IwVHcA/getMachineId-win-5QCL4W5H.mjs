import {
  require_execAsync
} from "./chunk-6RXPCIHM.mjs";
import {
  esm_exports,
  init_esm as init_esm2
} from "./chunk-UPQ46A2I.mjs";
import {
  __commonJS,
  __name,
  __require,
  __toCommonJS,
  init_esm
} from "./chunk-JN2GKVDO.mjs";

// ../../Library/Caches/pnpm/dlx/886e157b61cdcb21f1e5048f3649e59a7fcfc579327ce6a4d853a479cb024479/19e5ab07da7-11ccb/node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-win.js
var require_getMachineId_win = __commonJS({
  "../../Library/Caches/pnpm/dlx/886e157b61cdcb21f1e5048f3649e59a7fcfc579327ce6a4d853a479cb024479/19e5ab07da7-11ccb/node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-win.js"(exports) {
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMachineId = void 0;
    var process = __require("process");
    var execAsync_1 = require_execAsync();
    var api_1 = (init_esm2(), __toCommonJS(esm_exports));
    async function getMachineId() {
      const args = "QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid";
      let command = "%windir%\\System32\\REG.exe";
      if (process.arch === "ia32" && "PROCESSOR_ARCHITEW6432" in process.env) {
        command = "%windir%\\sysnative\\cmd.exe /c " + command;
      }
      try {
        const result = await (0, execAsync_1.execAsync)(`${command} ${args}`);
        const parts = result.stdout.split("REG_SZ");
        if (parts.length === 2) {
          return parts[1].trim();
        }
      } catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
      }
      return void 0;
    }
    __name(getMachineId, "getMachineId");
    exports.getMachineId = getMachineId;
  }
});
export default require_getMachineId_win();
//# sourceMappingURL=getMachineId-win-5QCL4W5H.mjs.map
