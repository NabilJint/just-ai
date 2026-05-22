"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function CreateProjectDialog() {

  const { confirmCreate } = useProjectActions();

  const {
    activeDialog,
    projectName,
    projectSlug,
    isLoading,
    error,
    closeDialog,
    updateProjectName,
  } = useProjectDialogs();

  if (activeDialog !== "create") return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 gap-6 overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-duo-green/10 text-duo-green rounded-xl">
              <Plus className="size-5 stroke-[3]" />
            </div>
            <DialogTitle className="font-feather text-heading-sm text-text-primary uppercase tracking-wide">
              Create Project
            </DialogTitle>
          </div>
          <DialogDescription className="font-din-round text-caption text-text-muted">
            Set up a new system design workspace. Your project will be
            accessible via a unique slug.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-caption font-bold text-text-primary uppercase tracking-wider font-din-round">
              Project Name
            </label>
            <Input
              placeholder="e.g. Global Payment System"
              value={projectName}
              onChange={(e) => updateProjectName(e.target.value)}
              className="rounded-xl h-11 bg-bg-elevated border-border text-text-primary placeholder:text-text-muted/50 focus:ring-duo-green"
              autoFocus
            />
          </div>

          <div className="p-3 bg-bg-elevated rounded-2xl border border-border/50 flex items-center justify-between">
            <span className="text-caption font-medium text-text-muted font-din-round uppercase tracking-tight">
              Project Slug
            </span>
            <span className="font-mono text-caption font-bold text-duo-green">
              {projectSlug || "your-project-name"}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-caption text-red-500 font-din-round">{error}</p>
          </div>
        )}

        <DialogFooter className="flex gap-3 sm:justify-between">
          <Button
            variant="ghost"
            onClick={closeDialog}
            className="rounded-xl text-text-secondary hover:text-text-primary font-din-round uppercase tracking-wider text-caption"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmCreate}
            disabled={!projectName || !projectSlug || isLoading}
            className="bg-duo-green hover:bg-duo-green/90 text-bg-base font-bold rounded-xl px-6 shadow-[0_4px_0_#3f8f01] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:pointer-events-none font-feather uppercase tracking-wider text-caption"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
