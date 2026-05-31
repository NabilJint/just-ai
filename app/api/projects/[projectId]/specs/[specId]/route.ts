import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

export const runtime = "nodejs";

function looksLikeHtml(content: string): boolean {
  const trimmed = content.trimStart();
  return trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.startsWith("<!doctype");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, specId } = await params;

    const project = await getProjectWithAccess(projectId);

    if (!project) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId },
      select: {
        id: true,
        projectId: true,
        content: true,
        filePath: true,
        createdAt: true,
      },
    });

    if (!spec || spec.projectId !== projectId) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    let content = spec.content;

    if (!content && spec.filePath) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      try {
        const blobResponse = await fetch(spec.filePath, {
          signal: controller.signal,
        });

        if (blobResponse.ok) {
          const blobContent = await blobResponse.text();

          if (!looksLikeHtml(blobContent)) {
            content = blobContent;
          }
        }
      } catch {
        console.warn("SPEC_JSON_BLOB_FETCH_FAILED", { specId });
      } finally {
        clearTimeout(timeout);
      }
    }

    return Response.json({ id: spec.id, projectId: spec.projectId, content, createdAt: spec.createdAt });
  } catch (error) {
    console.error("SPEC_FETCH_ERROR", error);
    return Response.json(
      { error: "Failed to fetch spec" },
      { status: 500 },
    );
  }
}
