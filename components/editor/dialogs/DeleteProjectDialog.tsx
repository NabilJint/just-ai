"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function DeleteProjectDialog() {
  const { activeDialog, isLoading, error, closeDialog } = useProjectDialogs();
  const { confirmDelete } = useProjectActions();

  if (activeDialog !== "delete") return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 gap-6 overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
              <Trash2 className="size-5 stroke-[3]" />
            </div>
            <DialogTitle className="font-feather text-heading-sm text-text-primary uppercase tracking-wide">
              Delete Project
            </DialogTitle>
          </div>
          <DialogDescription className="font-din-round text-caption text-text-muted">
            This action cannot be undone. All architecture diagrams, notes, and
            collaborators will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-body font-medium text-text-primary font-din-round">
            Are you sure you want to delete this project?
          </p>
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
            onClick={() => confirmDelete()}
            disabled={isLoading}
            variant="destructive3d"
          >
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
