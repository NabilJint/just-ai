import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";
import {
  getCanvasBlobPath,
  parseCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";

function isCanvasSnapshotBody(value: unknown): value is CanvasSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Array.isArray(record.nodes) && Array.isArray(record.edges);
}

/**
 * GET /api/projects/[projectId]/canvas
 * Returns the saved canvas snapshot from Vercel Blob.
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
  const project = await getProjectWithAccess(projectId);

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (!project.canvasJsonPath) {
    return Response.json({ nodes: [], edges: [] } satisfies CanvasSnapshot);
  }

  const blobResponse = await fetch(project.canvasJsonPath);

  if (!blobResponse.ok) {
    return Response.json(
      { error: "Failed to load canvas snapshot" },
      { status: 502 },
    );
  }

  const snapshot = parseCanvasSnapshot(await blobResponse.json());

  if (!snapshot) {
    return Response.json(
      { error: "Invalid canvas snapshot" },
      { status: 500 },
    );
  }

  return Response.json(snapshot);
}

/**
 * PUT /api/projects/[projectId]/canvas
 * Uploads canvas JSON to Vercel Blob and stores the URL on the project.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectWithAccess(projectId);

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isCanvasSnapshotBody(body)) {
    return Response.json(
      { error: "Body must include nodes and edges arrays" },
      { status: 400 },
    );
  }

  const blob = await put(
    getCanvasBlobPath(projectId),
    JSON.stringify(body),
    {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    },
  );

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return Response.json({ url: blob.url });
}
