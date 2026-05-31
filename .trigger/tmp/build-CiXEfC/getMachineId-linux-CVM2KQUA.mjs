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

// ../../Library/Caches/pnpm/dlx/886e157b61cdcb21f1e5048f3649e59a7fcfc579327ce6a4d853a479cb024479/19e5ab07da7-11ccb/node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-linux.js
var require_getMachineId_linux = __commonJS({
  "../../Library/Caches/pnpm/dlx/886e157b61cdcb21f1e5048f3649e59a7fcfc579327ce6a4d853a479cb024479/19e5ab07da7-11ccb/node_modules/.pnpm/@opentelemetry+resources@2.0.1_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-linux.js"(exports) {
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMachineId = void 0;
    var fs_1 = __require("fs");
    var api_1 = (init_esm2(), __toCommonJS(esm_exports));
    async function getMachineId() {
      const paths = ["/etc/machine-id", "/var/lib/dbus/machine-id"];
      for (const path of paths) {
        try {
          const result = await fs_1.promises.readFile(path, { encoding: "utf8" });
          return result.trim();
        } catch (e) {
          api_1.diag.debug(`error reading machine id: ${e}`);
        }
      }
      return void 0;
    }
    __name(getMachineId, "getMachineId");
    exports.getMachineId = getMachineId;
  }
});
export default require_getMachineId_linux();
//# sourceMappingURL=getMachineId-linux-CVM2KQUA.mjs.map
