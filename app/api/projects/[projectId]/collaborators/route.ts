import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projects/[projectId]/collaborators
 * - List collaborators for a project. Owners and collaborators may view.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Allow owners and collaborators to view
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId).catch(() => null);
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || null;

  const hasAccess =
    project.ownerId === userId ||
    (userEmail &&
      (await prisma.projectCollaborator.count({
        where: { projectId, email: userEmail },
      })) > 0);

  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  // Enrich collaborators with Clerk info when available
  const enriched = await Promise.all(
    collaborators.map(async (c) => {
      try {
        const users = await clerk.users.getUserList({
          emailAddress: [c.email],
        });
        const user = (users as any)?.[0];

        return {
          email: c.email,
          id: c.id,
          createdAt: c.createdAt,
          displayName: user ? user.fullName || user.firstName || null : null,
          avatar: user ? user.profileImageUrl || null : null,
        };
      } catch (e) {
        return {
          email: c.email,
          id: c.id,
          createdAt: c.createdAt,
          displayName: null,
          avatar: null,
        };
      }
    }),
  );

  return Response.json(enriched);
}

/**
 * POST /api/projects/[projectId]/collaborators
 * Body: { email: string }
 * - Only owners may invite collaborators.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clerk = await clerkClient();

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const collab = await prisma.projectCollaborator.create({
      data: { projectId, email },
    });

    // Return enriched collaborator
    try {
      const users = await clerk.users.getUserList({ emailAddress: [email] });
      const user = (users as any)?.[0];
      return Response.json(
        {
          id: collab.id,
          email: collab.email,
          createdAt: collab.createdAt,
          displayName: user ? user.fullName || user.firstName || null : null,
          avatar: user ? user.profileImageUrl || null : null,
        },
        { status: 201 },
      );
    } catch {
      return Response.json(collab, { status: 201 });
    }
  } catch (e: any) {
    if (e?.code === "P2002") {
      return Response.json({ error: "Already invited" }, { status: 409 });
    }
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[projectId]/collaborators
 * Body: { email: string }
 * - Only owners may remove collaborators.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  await prisma.projectCollaborator.deleteMany({ where: { projectId, email } });

  return Response.json({ success: true });
}
