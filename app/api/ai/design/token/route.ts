import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { parseDesignTokenBody } from "@/lib/design-agent";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ai/design/token
 * Issues a Trigger.dev public token scoped to a run owned by the caller.
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

  const parsed = parseDesignTokenBody(body);

  if (!parsed) {
    return Response.json({ error: "Body must include runId" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId: parsed.runId },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [parsed.runId],
      },
    },
    expirationTime: "1h",
  });

  return Response.json({ token });
}
