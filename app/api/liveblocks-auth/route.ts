import { auth, currentUser } from "@clerk/nextjs/server";
import { checkProjectAccess } from "@/lib/project-access";
import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks";

export const runtime = "nodejs";

interface LiveblocksAuthRequest {
  projectId?: unknown;
  room?: unknown;
}

function getRequestedProjectId(body: LiveblocksAuthRequest) {
  return typeof body.projectId === "string"
    ? body.projectId
    : typeof body.room === "string"
      ? body.room
      : null;
}

function resolveDisplayName(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): string {
  if (user.fullName) return user.fullName;
  if (user.firstName) return user.firstName;
  if (user.username) return user.username;
  if (user.emailAddresses[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.split("@")[0];
  }
  return "Collaborator";
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: LiveblocksAuthRequest;
  try {
    body = (await request.json()) as LiveblocksAuthRequest;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = getRequestedProjectId(body);

  if (!projectId) {
    return Response.json({ error: "Project ID is required" }, { status: 400 });
  }

  const hasAccess = await checkProjectAccess(projectId);

  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let displayName = "Collaborator";
  let avatarUrl: string | null = null;

  try {
    const user = await currentUser();
    if (user) {
      displayName = resolveDisplayName(user);
      avatarUrl = user.imageUrl ?? null;
    }
  } catch (e) {
    console.warn("Failed to resolve user identity for presence", e);
  }

  const cursorColor = getCursorColor(userId);
  const liveblocks = getLiveblocksClient();

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      userId,
      displayName,
      avatarUrl,
      cursorColor,
    },
  });

  session.allow(projectId, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();

  return new Response(responseBody, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
