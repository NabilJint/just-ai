"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileCode, Loader2, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SpecPreviewDialogProps {
  specId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SpecPreviewDialog({
  specId,
  projectId,
  open,
  onOpenChange,
}: SpecPreviewDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      setContent(null);

      try {
        const res = await fetch(
          `/api/projects/${projectId}/specs/${specId}`,
        );
        if (!res.ok) {
          throw new Error("Failed to load spec");
        }
        const data = await res.json();
        setContent(data.content || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [open, specId, projectId]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
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
      setError(msg);
    } finally {
      setDownloading(false);
    }
  }, [projectId, specId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[98vw]
          max-w-[1600px]
          sm:max-w-[1600px]
          max-h-[95dvh]
          h-[95vh]
          p-0
          overflow-hidden
          flex flex-col
          bg-bg-base
          border-border
          rounded-3xl
        "
      >
        {/* Hidden title for Radix accessibility — screen reader only */}
        <DialogTitle className="sr-only">Architecture Specification</DialogTitle>

        {/* Sticky header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b border-border shrink-0 bg-bg-surface">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center size-8 rounded-xl bg-accent-primary/10 shrink-0">
              <FileCode className="size-4 text-accent-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text-primary leading-tight">
                Architecture Specification
              </h2>
              <p className="text-xs text-text-muted leading-tight mt-0.5">
                AI-generated technical spec from canvas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="p-4 text-xs border-border text-text-secondary hover:text-text-primary"
              onClick={handleDownload}
              disabled={downloading || loading || !content}
            >
              {downloading ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="size-3.5 mr-1.5" />
              )}
              {downloading ? "Downloading…" : "Download"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-xl text-text-muted hover:text-text-primary"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Body — directly scrollable. No Radix ScrollArea wrapper:
            the viewport layer adds overflow: hidden internally, which clips
            content inside the flex layout. A plain div gives us full control. */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="size-6 animate-spin text-accent-primary" />
              <p className="text-sm text-text-muted">Loading specification…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
              <p className="text-sm text-state-error">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          )}

          {!loading && !error && content === "" && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <FileCode className="size-8 text-text-muted" />
              <p className="text-sm text-text-muted">Spec content not available</p>
            </div>
          )}

          {content && (
            /* Document reader layout */
            <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10">
              <div
                className="
                  prose prose-invert
                  prose-headings:text-text-primary
                  prose-headings:font-semibold
                  prose-h1:text-lg sm:prose-h1:text-xl lg:prose-h1:text-2xl prose-h1:mb-4 sm:prose-h1:mb-6 prose-h1:pb-3 sm:prose-h1:pb-4 prose-h1:border-b prose-h1:border-border
                  prose-h2:text-base sm:prose-h2:text-lg lg:prose-h2:text-xl prose-h2:mt-6 sm:prose-h2:mt-10 prose-h2:mb-3 sm:prose-h2:mb-4
                  prose-h3:text-sm sm:prose-h3:text-base prose-h3:mt-4 sm:prose-h3:mt-6 prose-h3:mb-2 sm:prose-h3:mb-3
                  prose-p:text-text-secondary prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm
                  prose-li:text-text-secondary prose-li:text-xs sm:prose-li:text-sm
                  prose-strong:text-text-primary
                  prose-code:text-accent-primary prose-code:bg-bg-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[11px] sm:prose-code:text-xs
                  prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:overflow-x-auto
                  prose-code:break-words
                  prose-table:text-xs sm:prose-table:text-sm prose-table:block prose-table:overflow-x-auto
                  prose-th:text-text-primary prose-th:border-border
                  prose-td:text-text-secondary prose-td:border-border
                  prose-hr:border-border
                  prose-a:text-accent-primary hover:prose-a:text-accent-primary/80
                  prose-img:max-w-full prose-img:h-auto
                  break-words
                  max-w-none
                "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
