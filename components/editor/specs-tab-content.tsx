"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileCode, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { generateSpecTask } from "@/trigger/generate-spec";
import SpecPreviewDialog from "@/components/editor/spec-preview-dialog";
import { useCanvasState } from "@/hooks/use-canvas-state-context";

interface SpecItem {
  id: string;
  createdAt: string;
}

interface SpecsTabContentProps {
  projectId: string;
}

export default function SpecsTabContent({
  projectId,
}: SpecsTabContentProps) {
  const { nodes: contextNodes, edges: contextEdges } = useCanvasState();
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSpecId, setPreviewSpecId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (!res.ok) {
        throw new Error("Failed to load specs");
      }
      const data = await res.json();
      setSpecs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const { run } = useRealtimeRun<typeof generateSpecTask>(
    runId ?? "",
    {
      accessToken: accessToken ?? "",
      enabled: Boolean(runId && accessToken),
    },
  );

  useEffect(() => {
    if (!run?.status) return;

    if (run.status === "COMPLETED" || run.status === "FAILED") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRunId(null);
      setAccessToken(null);
      setGenerating(false);
      fetchSpecs();
    }
  }, [run?.status, fetchSpecs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSpecs();
  }, [fetchSpecs]);

  const handleGenerateSpec = useCallback(async () => {
    if (generating) return;

    setGenerating(true);
    setGenError(null);

    try {
      let nodes: Record<string, unknown>[] = (contextNodes as unknown as Record<string, unknown>[]) || [];
      let edges: Record<string, unknown>[] = (contextEdges as unknown as Record<string, unknown>[]) || [];
      const source = contextNodes && contextNodes.length > 0 ? "live_context" : "database_fallback";

      if (nodes.length === 0) {
        try {
          const canvasRes = await fetch(`/api/projects/${projectId}/canvas`);

          if (canvasRes.ok) {
            const canvas = (await canvasRes.json()) as {
              nodes?: Record<string, unknown>[];
              edges?: Record<string, unknown>[];
            };
            nodes = canvas.nodes ?? [];
            edges = canvas.edges ?? [];
          }
        } catch {
          console.warn("Failed to fetch canvas state, using empty canvas");
        }
      }

      console.log("CANVAS_SOURCE", source);
      console.log("NODE_COUNT", nodes.length);
      console.log(
        "NODE_LABELS",
        nodes.map(n => (n.data as Record<string, unknown>)?.label)
      );

      if (nodes.length === 0) {
        throw new Error(
          "Cannot generate a spec from an empty canvas. Add components to your diagram first.",
        );
      }

      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: projectId,
          chatHistory: [],
          nodes,
          edges,
        }),
      });

      if (!specRes.ok) {
        const err = (await specRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? "Failed to generate spec");
      }

      const { runId: newRunId } = (await specRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to authorize run subscription");
      }

      const { token } = (await tokenRes.json()) as { token: string };

      setRunId(newRunId);
      setAccessToken(token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setGenError(msg);
      setGenerating(false);
    }
  }, [projectId, generating, contextNodes, contextEdges]);

  const handleDownload = useCallback(
    async (specId: string) => {
      setDownloadingId(specId);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/specs/${specId}/download`,
        );
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to download spec");
        }
        const text = await res.text();
        const blob = new Blob([text], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spec-${specId}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Download failed";
        setGenError(msg);
      } finally {
        setDownloadingId(null);
      }
    },
    [projectId],
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Button
        onClick={handleGenerateSpec}
        disabled={generating}
        className={cn(
          "w-full mb-4 shrink-0",
          generating
            ? "bg-accent/50 text-white/70 cursor-not-allowed"
            : "bg-accent text-white hover:bg-accent/90 cursor-pointer",
        )}
      >
        {generating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Generating…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Generate Spec
          </span>
        )}
      </Button>

      {genError && (
        <p className="text-xs text-state-error text-center mb-3">{genError}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Generated Specs
        </h3>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-4 animate-spin text-text-muted" />
          </div>
        )}

        {error && (
          <p className="text-xs text-state-error text-center py-8">{error}</p>
        )}

        {!loading && !error && specs.length === 0 && (
          <p className="text-xs text-text-muted text-center py-8">
            No specs generated yet.
          </p>
        )}

        {!loading && specs.length > 0 && (
          <div className="space-y-2">
            {specs.map((spec) => (
              <div
                key={spec.id}
                role="button"
                tabIndex={0}
                onClick={() => setPreviewSpecId(spec.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPreviewSpecId(spec.id);
                  }
                }}
                className={cn(
                  "w-full text-left rounded-xl border border-border bg-bg-elevated p-3",
                  "hover:border-accent/50 hover:bg-bg-subtle transition-colors cursor-pointer",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="size-4 text-accent-text shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-text-primary block truncate">
                        {formatDate(spec.createdAt)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Architecture Spec
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 rounded-lg text-text-muted hover:text-text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(spec.id);
                    }}
                  >
                    {downloadingId === spec.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewSpecId && (
        <SpecPreviewDialog
          specId={previewSpecId}
          projectId={projectId}
          open={!!previewSpecId}
          onOpenChange={(open) => {
            if (!open) setPreviewSpecId(null);
          }}
        />
      )}
    </div>
  );
}
