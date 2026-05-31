import { mutateFlow } from "@liveblocks/react-flow/node";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { getLiveblocksClient } from "@/lib/liveblocks";
import {
  buildEdgeFromAddAction,
  buildNodeFromAddAction,
  resolveNodeColor,
  type DesignAction,
} from "@/lib/design-agent-actions";
import type { CanvasSnapshot } from "@/lib/canvas-snapshot";

const FLOW_STORAGE_KEY = "flow";

interface FlowStorageJson {
  nodes?: Record<string, CanvasNode>;
  edges?: Record<string, CanvasEdge>;
}

export async function getCanvasSnapshotFromRoom(
  roomId: string,
): Promise<CanvasSnapshot> {
  const client = getLiveblocksClient();
  const doc = (await client.getStorageDocument(roomId, "json")) as Record<
    string,
    FlowStorageJson | undefined
  >;

  const flow = doc[FLOW_STORAGE_KEY];
  const nodes = flow?.nodes ? Object.values(flow.nodes) : [];
  const edges = flow?.edges ? Object.values(flow.edges) : [];

  return { nodes, edges };
}

export async function applyDesignActions(
  roomId: string,
  actions: DesignAction[],
): Promise<{ applied: number }> {
  const client = getLiveblocksClient();
  const idMap = new Map<string, string>();
  let applied = 0;

  await mutateFlow<CanvasNode, CanvasEdge>(
    {
      client,
      roomId,
      storageKey: FLOW_STORAGE_KEY,
    },
    (flow) => {
      const resolveId = (id: string) => idMap.get(id) ?? id;

      for (const action of actions) {
        switch (action.type) {
          case "addNode": {
            const node = buildNodeFromAddAction(action);
            if (action.tempId) {
              idMap.set(action.tempId, node.id);
            }
            flow.addNode(node);
            applied += 1;
            break;
          }
          case "moveNode": {
            const id = resolveId(action.id);
            if (!flow.getNode(id)) break;
            flow.updateNode(id, { position: { x: action.x, y: action.y } });
            applied += 1;
            break;
          }
          case "resizeNode": {
            const id = resolveId(action.id);
            if (!flow.getNode(id)) break;
            flow.updateNode(id, {
              width: action.width,
              height: action.height,
            });
            flow.updateNodeData(id, {
              size: { width: action.width, height: action.height },
            });
            applied += 1;
            break;
          }
          case "updateNodeData": {
            const id = resolveId(action.id);
            const node = flow.getNode(id);
            if (!node) break;

            const shape = action.shape ?? node.data?.shape;
            const paletteIndex = action.paletteIndex;
            const color =
              shape && paletteIndex !== undefined
                ? resolveNodeColor(shape, paletteIndex)
                : node.data?.color;

            flow.updateNodeData(id, {
              ...(action.label !== undefined ? { label: action.label } : {}),
              ...(shape ? { shape } : {}),
              ...(color ? { color } : {}),
            });
            applied += 1;
            break;
          }
          case "deleteNode": {
            const id = resolveId(action.id);
            if (!flow.getNode(id)) break;
            flow.removeNode(id);
            applied += 1;
            break;
          }
          case "addEdge": {
            const edge = buildEdgeFromAddAction(action, resolveId);
            if (action.tempId) {
              idMap.set(action.tempId, edge.id);
            }
            flow.addEdge(edge);
            applied += 1;
            break;
          }
          case "deleteEdge": {
            const id = resolveId(action.id);
            if (!flow.getEdge(id)) break;
            flow.removeEdge(id);
            applied += 1;
            break;
          }
        }
      }
    },
  );

  return { applied };
}
