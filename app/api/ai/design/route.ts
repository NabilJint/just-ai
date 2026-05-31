import { auth } from "@clerk/nextjs/server";
import { designAgentTask } from "@/trigger/design-agent";
import {
  parseDesignTriggerBody,
  toDesignTaskPayload,
} from "@/lib/design-agent";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

/**
 * POST /api/ai/design
 * Triggers the design background task and records the run for ownership checks.
 */
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseDesignTriggerBody(body);

  if (!parsed) {
    return Response.json(
      { error: "Body must include prompt, roomId, and projectId" },
      { status: 400 },
    );
  }

  if (parsed.roomId !== parsed.projectId) {
    return Response.json(
      { error: "roomId must match projectId" },
      { status: 400 },
    );
  }

  const project = await getProjectWithAccess(parsed.projectId);

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const handle = await designAgentTask.trigger(toDesignTaskPayload(parsed));

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: parsed.projectId,
      userId,
    },
  });

  return Response.json({ runId: handle.id });
}
