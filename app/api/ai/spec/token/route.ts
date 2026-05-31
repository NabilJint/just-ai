import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { specTokenSchema } from "@/lib/spec-agent";
import { prisma } from "@/lib/prisma";

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

  const parsed = specTokenSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Body must include runId" },
      { status: 400 },
    );
  }

  const { runId } = parsed.data;

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });

  return Response.json({ token });
}
