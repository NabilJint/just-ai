import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { buildSharedProjectFilter } from "@/lib/project-helpers";

/**
 * GET /api/projects
 * List all projects the authenticated user can see (owned + shared).
 * Shared project entries include an `isShared` flag.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  const sharedCollabs = await prisma.projectCollaborator.findMany({
    where: {
      OR: await buildSharedProjectFilter(userId),
    },
    include: {
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Deduplicate projects that appear in both owned and shared
  const ownedIds = new Set(owned.map((p) => p.id));
  const shared = sharedCollabs
    .map((c) => c.project)
    .filter((p) => !ownedIds.has(p.id))
    .map((p) => ({ ...p, isShared: true }));

  return Response.json([...owned, ...shared]);
}

/**
 * POST /api/projects
 * Create a new project for the authenticated user.
 * Body: { name?: string }
 */
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let name = "Untitled Project";

  try {
    const body = await request.json();
    if (body.name && typeof body.name === "string" && body.name.trim()) {
      name = body.name.trim();
    }
  } catch {
    // No body or invalid JSON — use default name
  }

  function toSlug(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function shortSuffix(): string {
    return Math.random().toString(36).slice(2, 6);
  }

  const base = toSlug(name || "untitled-project");
  const id = `${base}-${shortSuffix()}`;

  const project = await prisma.project.create({
    data: {
      id,
      ownerId: userId,
      name,
    },
  });

  return Response.json(project, { status: 201 });
}
