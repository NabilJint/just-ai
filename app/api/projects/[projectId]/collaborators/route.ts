import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  ProjectCollaboratorValidationError,
  getProjectCollaborators,
  addProjectCollaborator,
  removeProjectCollaborator,
} from "@/lib/project-collaborators";

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

  // Simple access check: owner or collaborator
  const { email } = await (async () => {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(userId).catch(() => null);
    return { email: user?.emailAddresses?.[0]?.emailAddress || null };
  })();

  const hasAccess =
    project.ownerId === userId ||
    (email &&
      (await prisma.projectCollaborator.count({
        where: { projectId, email },
      })) > 0);

  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const collaborators = await getProjectCollaborators(projectId);
    return Response.json(collaborators);
  } catch (e) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
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

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const collaborator = await addProjectCollaborator(projectId, email);
    return Response.json(collaborator, { status: 201 });
  } catch (e: any) {
    if (e instanceof ProjectCollaboratorValidationError) {
      return Response.json({ error: e.message }, { status: 400 });
    }
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

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await removeProjectCollaborator(projectId, email);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
