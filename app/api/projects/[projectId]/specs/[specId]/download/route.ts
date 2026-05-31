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
  });

  if (!spec || spec.projectId !== projectId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  let content = spec.content;

  if (!content) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const blobResponse = await fetch(spec.filePath, {
        signal: controller.signal,
      });

      if (blobResponse.ok) {
        const blobContent = await blobResponse.text();

        if (!looksLikeHtml(blobContent)) {
          content = blobContent;
        } else {
          console.warn("DOWNLOAD_BLOB_HTML", { specId, filePath: spec.filePath });
        }
      }
    } catch (error) {
      console.error("DOWNLOAD_BLOB_FETCH_ERROR", { specId, error });
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!content || looksLikeHtml(content)) {
    return Response.json(
      { error: "Spec content not available" },
      { status: 502 },
    );
  }

  const filename = `spec-${specId}.md`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
