import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const project = await getProjectWithAccess(projectId);

    if (!project) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return Response.json(specs);
  } catch (error) {
    console.error("SPECS_LIST_ERROR", error);

    return Response.json(
      {
        error: "Failed to load specs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
