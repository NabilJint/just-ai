"use client";

import React, { useState } from "react";
import ProjectSidebar from "./project-sidebar";
import EditorNavbar from "./editor-navbar";
import { ProjectDialogProvider } from "@/hooks/use-project-dialogs";
import { Button } from "@/components/ui/button";
import { Sparkles, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/project-helpers";
import ShareDialog from "./dialogs/ShareDialog";
import CreateProjectDialog from "./dialogs/CreateProjectDialog";
import RenameProjectDialog from "./dialogs/RenameProjectDialog";
import DeleteProjectDialog from "./dialogs/DeleteProjectDialog";

interface WorkspaceLayoutProps {
  project: any; // server-side Project model shape
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
  children: React.ReactNode;
}

export default function WorkspaceLayout({
  project,
  ownedProjects,
  sharedProjects,
  children,
}: WorkspaceLayoutProps) {
  // default closed to avoid reopening after navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <ProjectDialogProvider>
      <div className="relative h-screen w-full overflow-hidden bg-background text-foreground flex flex-col">
        {/* Top Navbar (reuse existing component) */}
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          projectName={project.name}
          onToggleAiChat={() => setIsAiOpen(!isAiOpen)}
          onShare={() => setIsShareOpen(true)}
        />

        <ShareDialog
          open={isShareOpen}
          onOpenChange={(open: boolean) => setIsShareOpen(open)}
          project={project}
        />
        {/* Project dialogs (must be inside the same ProjectDialogProvider) */}
        <CreateProjectDialog />
        <RenameProjectDialog />
        <DeleteProjectDialog />

        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Project Sidebar */}
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            currentProjectId={project.id}
          />

          {/* Main Canvas Area */}
          <main
            className={cn(
              "flex-1 relative transition-all duration-300 ease-in-out",
              isSidebarOpen ? "ml-[320px]" : "ml-0",
            )}
          >
            {children}
          </main>

          {/* Right AI Sidebar Placeholder (match project sidebar width) */}
          <aside
            className={cn(
              "absolute top-0 right-0 h-full w-[320px] bg-card border-l border-border z-40",
              "flex flex-col transition-transform duration-300 ease-in-out",
              isAiOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
              <span className="font-feather text-heading-sm text-text-primary uppercase tracking-wider">
                AI Assistant
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAiOpen(false)}
                className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer size-8"
              >
                <PanelRight className="size-4" />
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 text-center space-y-4">
              <div className="p-4 bg-bg-elevated rounded-2xl text-text-muted border border-border">
                <Sparkles className="size-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-body font-bold text-text-primary font-din-round tracking-wide uppercase">
                  AI Contextual Help
                </h3>
                <p className="text-caption text-text-muted max-w-[220px] font-din-round">
                  The AI assistant will appear here to help you build your
                  architecture.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </ProjectDialogProvider>
  );
}
