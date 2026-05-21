"use client"

import React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"


export default function EditorHome() {
  const { openDialog } = useProjectDialogs();
  return (
    <main className="absolute inset-0 flex items-center justify-center bg-bg-base text-text-secondary select-none z-10">
      <div className="text-center space-y-6 max-w-md p-6">
        <div className="space-y-3">
          <h2 className="font-feather text-heading text-text-primary uppercase tracking-wide leading-tight">
            Create a project or open an existing one
          </h2>
          <p className="font-din-round text-body text-text-muted max-w-sm mx-auto leading-relaxed">
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
        </div>

        <Button
          onClick={() => openDialog("create")}
          variant="primary3d"
          className="w-full py-6 px-8 rounded-2xl text-base"
        >
          <Plus className="size-5 stroke-[3]" />
          New Project
        </Button>
      </div>
    </main>
  );
}
