"use client"

import React from "react"
import { X, Plus, FolderGit2, Users, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProjectSidebar({
  isOpen,
  onClose,
}: ProjectSidebarProps) {
  const { openDialog } = useProjectDialogs()

  const mockProjects = [
    { id: "1", name: "Global Payment Gateway", slug: "global-payment-gateway", isOwned: true },
    { id: "2", name: "E-commerce Engine", slug: "e-commerce-engine", isOwned: true },
    { id: "3", name: "AI Agent Orchestrator", slug: "ai-agent-orchestrator", isOwned: false },
  ]

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

          {/* My Projects List */}
          <TabsContent
            value="my-projects"
            className="flex-1 flex flex-col gap-2 mt-4 outline-none"
          >
            {mockProjects.filter(p => p.isOwned).map(project => (
              <div
                key={project.id}
                className="group relative p-3 rounded-xl bg-bg-elevated border border-border hover:border-duo-green/50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FolderGit2 className="size-4 text-text-muted group-hover:text-duo-green transition-colors" />
                  <span className="text-caption font-medium text-text-secondary group-hover:text-text-primary font-din-round uppercase tracking-wide">
                    {project.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-text-muted hover:text-duo-green transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDialog("rename", project.name);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDialog("delete");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {mockProjects.filter(p => p.isOwned).length === 0 && (
              <div className="flex flex-col justify-center items-center p-6 text-center space-y-4">
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
              </div>
            )}
          </TabsContent>

          {/* Shared Projects List */}
          <TabsContent
            value="shared"
            className="flex-1 flex flex-col gap-2 mt-4 outline-none"
          >
            {mockProjects.filter(p => !p.isOwned).map(project => (
              <div
                key={project.id}
                className="group relative p-3 rounded-xl bg-bg-elevated border border-border hover:border-duo-green/50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Users className="size-4 text-text-muted group-hover:text-duo-green transition-colors" />
                  <span className="text-caption font-medium text-text-secondary group-hover:text-text-primary font-din-round uppercase tracking-wide">
                    {project.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Shared projects have no actions */}
                </div>
              </div>
            ))}
            {mockProjects.filter(p => !p.isOwned).length === 0 && (
              <div className="flex flex-col justify-center items-center p-6 text-center space-y-4">
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
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <Button
            onClick={() => openDialog("create")}
            variant="primary3d"
            className="w-full py-2.5"
          >
            <Plus className="size-4 stroke-[3]" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
