"use client";

import React, { useState } from "react";
import ProjectSidebar from "./project-sidebar";
import EditorNavbar from "./editor-navbar";
import AiAssistantSidebar from "./ai-assistant-sidebar";
import { ProjectDialogProvider } from "@/hooks/use-project-dialogs";
import { CanvasSaveStatusProvider } from "@/hooks/use-canvas-save-status";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/project-helpers";
import ShareDialog from "./dialogs/ShareDialog";
import CreateProjectDialog from "./dialogs/CreateProjectDialog";
import RenameProjectDialog from "./dialogs/RenameProjectDialog";
import DeleteProjectDialog from "./dialogs/DeleteProjectDialog";

interface WorkspaceProject {
  id: string;
  name: string;
  ownerId: string;
}

interface WorkspaceLayoutProps {
  project: WorkspaceProject;
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
      <CanvasSaveStatusProvider>
      <div className="relative h-screen w-full overflow-hidden bg-background text-foreground flex flex-col">
        {/* Top Navbar (reuse existing component) */}
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          projectName={project.name}
          onToggleAiChat={() => setIsAiOpen(!isAiOpen)}
          onShare={() => setIsShareOpen(true)}
          onOpenTemplates={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("open-starter-templates"));
            }
          }}
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
          <main className="flex-1 relative h-full w-full">{children}</main>

          <AiAssistantSidebar
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
          />
        </div>
      </div>
      </CanvasSaveStatusProvider>
    </ProjectDialogProvider>
  );
}
