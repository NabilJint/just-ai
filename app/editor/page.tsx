"use client"

import React, { useState } from "react";
import EditorNavbar from "@/components/editor/editor-navbar";
import ProjectSidebar from "@/components/editor/project-sidebar";
import EditorHome from "@/components/editor/editor-home";
import { ProjectDialogProvider, useProjectDialogs } from "@/hooks/use-project-dialogs";
import CreateProjectDialog from "@/components/editor/dialogs/CreateProjectDialog";
import RenameProjectDialog from "@/components/editor/dialogs/RenameProjectDialog";
import DeleteProjectDialog from "@/components/editor/dialogs/DeleteProjectDialog";

function EditorContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { openDialog } = useProjectDialogs();

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
        />

        <EditorHome onCreateProject={() => openDialog("create")} />

        {/* Project Dialogs */}
        <CreateProjectDialog />
        <RenameProjectDialog />
        <DeleteProjectDialog />
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <ProjectDialogProvider>
      <EditorContent />
    </ProjectDialogProvider>
  );
}
