import { auth } from "@clerk/nextjs/server";
import { generateSpecTask } from "@/trigger/generate-spec";
import { specTriggerSchema } from "@/lib/spec-agent";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

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

  const parsed = specTriggerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { roomId, chatHistory, nodes, edges } = parsed.data;

  const project = await getProjectWithAccess(roomId);

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const handle = await generateSpecTask.trigger({
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId,
    },
  });

  return Response.json({ runId: handle.id });
}
