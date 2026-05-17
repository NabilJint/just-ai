"use client"

import React from "react"
import { X, Plus, FolderGit2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProjectSidebar({
  isOpen,
  onClose,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Backdrop (closes sidebar on outside click, floats above canvas but below sidebar) */}
      <div
        className={cn(
          "absolute inset-0 bg-background/40 backdrop-blur-xs z-30 transition-opacity duration-300 pointer-events-none opacity-0",
          isOpen && "pointer-events-auto opacity-100"
        )}
        onClick={onClose}
      />

      {/* Sidebar Shell Container */}
      <aside
        className={cn(
          "absolute top-0 left-0 h-full w-[320px] bg-card border-r border-border z-40",
          "flex flex-col shadow-2xl transition-transform duration-300 ease-in-out select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <span className="font-feather text-heading-sm text-text-primary uppercase tracking-wider">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="my-projects" className="flex-1 flex flex-col min-h-0 p-4">
          <TabsList className="grid grid-cols-2 bg-bg-elevated p-1 rounded-xl shrink-0">
            <TabsTrigger
              value="my-projects"
              className="rounded-lg text-sm font-medium py-1.5 cursor-pointer font-din-round uppercase tracking-wider"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="rounded-lg text-sm font-medium py-1.5 cursor-pointer font-din-round uppercase tracking-wider"
            >
              Shared
            </TabsTrigger>
          </TabsList>

          {/* Empty Placeholder State: My Projects */}
          <TabsContent
            value="my-projects"
            className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-4 min-h-0 mt-4 outline-none"
          >
            <div className="p-4 bg-bg-elevated rounded-2xl text-text-muted border border-border">
              <FolderGit2 className="size-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-body font-bold text-text-primary font-din-round tracking-wide uppercase">
                No projects yet
              </h3>
              <p className="text-caption text-text-muted max-w-[220px] font-din-round">
                Create a new system design architecture to start pair programming with Antigravity.
              </p>
            </div>
          </TabsContent>

          {/* Empty Placeholder State: Shared */}
          <TabsContent
            value="shared"
            className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-4 min-h-0 mt-4 outline-none"
          >
            <div className="p-4 bg-bg-elevated rounded-2xl text-text-muted border border-border">
              <Users className="size-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-body font-bold text-text-primary font-din-round tracking-wide uppercase">
                No shared designs
              </h3>
              <p className="text-caption text-text-muted max-w-[220px] font-din-round">
                Collaborative architecture designs shared with you by other creators will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <Button
            className={cn(
              "w-full bg-duo-green hover:bg-duo-green/90 text-bg-base font-bold py-2.5 rounded-xl",
              "flex items-center justify-center gap-2 cursor-pointer transition-all uppercase font-feather tracking-wider",
              "shadow-[0_4px_0_#3f8f01] active:translate-y-1 active:shadow-none"
            )}
          >
            <Plus className="size-4 stroke-[3]" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
