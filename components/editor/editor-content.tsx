"use client";

import React, { useState } from "react";
import EditorNavbar from "@/components/editor/editor-navbar";
import ProjectSidebar from "@/components/editor/project-sidebar";
import EditorHome from "@/components/editor/editor-home";
import CreateProjectDialog from "@/components/editor/dialogs/CreateProjectDialog";
import RenameProjectDialog from "@/components/editor/dialogs/RenameProjectDialog";
import DeleteProjectDialog from "@/components/editor/dialogs/DeleteProjectDialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectData } from "@/lib/project-helpers";

interface EditorContentProps {
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

export default function EditorContent({
  ownedProjects,
  sharedProjects,
}: EditorContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectActions = useProjectActions();

  return (
    <div className="relative flex flex-col h-screen w-screen bg-bg-base overflow-hidden">
      {/* Editor top navigation bar */}
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="relative flex-1 w-full min-h-0 bg-bg-base overflow-hidden">
        {/* Floating overlay sidebar for project lists */}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          projectActions={projectActions}
        />

        <EditorHome
          onCreateProject={() => projectActions.openDialog("create")}
        />

        {/* Project Dialogs */}
        <CreateProjectDialog projectActions={projectActions} />
        <RenameProjectDialog projectActions={projectActions} />
        <DeleteProjectDialog projectActions={projectActions} />
      </div>
    </div>
  );
}
