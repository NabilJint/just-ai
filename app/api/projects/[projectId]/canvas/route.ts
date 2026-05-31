import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";
import {
  getCanvasBlobPath,
  parseCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";

const BLOB_FETCH_TIMEOUT_MS = 5_000;

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

    if (!project.canvasJsonPath) {
      return Response.json({ nodes: [], edges: [] } satisfies CanvasSnapshot);
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(
      () => abortController.abort(),
      BLOB_FETCH_TIMEOUT_MS,
    );

    let blobResponse: Response;

    try {
      blobResponse = await fetch(project.canvasJsonPath, {
        signal: abortController.signal,
      });
    } catch {
      console.warn(
        "CANVAS_BLOB_FETCH_FAILED",
        project.canvasJsonPath,
        "returning empty canvas",
      );
      return Response.json({ nodes: [], edges: [] } satisfies CanvasSnapshot);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!blobResponse.ok) {
      console.warn(
        "CANVAS_BLOB_NOT_OK",
        blobResponse.status,
        project.canvasJsonPath,
        "returning empty canvas",
      );
      return Response.json({ nodes: [], edges: [] } satisfies CanvasSnapshot);
    }

    let raw: unknown;

    try {
      raw = await blobResponse.json();
    } catch {
      console.warn(
        "CANVAS_BLOB_PARSE_FAILED",
        "returning empty canvas",
      );
      return Response.json({ nodes: [], edges: [] } satisfies CanvasSnapshot);
    }

    const snapshot = parseCanvasSnapshot(raw);

    if (!snapshot) {
      console.warn(
        "CANVAS_INVALID_SNAPSHOT",
        "returning empty canvas",
      );
      return Response.json({ nodes: [], edges: [] } satisfies CanvasSnapshot);
    }

    return Response.json(snapshot);
  } catch (error) {
    console.error("CANVAS_FETCH_ERROR", error);

    return Response.json(
      {
        error: "Failed to load canvas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/projects/[projectId]/canvas
 * Uploads canvas JSON to Vercel Blob and stores the URL on the project.
 */
export async function PUT(
  request: Request,
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
  } catch (error) {
    console.error("CANVAS_SAVE_ERROR", error);

    return Response.json(
      {
        error: "Failed to save canvas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
