"use client";

import React from "react";
import { X, Plus, FolderGit2, Users, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ProjectData } from "@/lib/project-helpers";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
  currentProjectId?: string;
}

export default function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  currentProjectId,
}: ProjectSidebarProps) {
  const { openDialog } = useProjectDialogs();

  const isCurrentProjectShared = React.useMemo(() => {
    return sharedProjects.some((p) => p.id === currentProjectId);
  }, [sharedProjects, currentProjectId]);

  const [activeTab, setActiveTab] = React.useState<string>(
    isCurrentProjectShared ? "shared" : "my-projects"
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(isCurrentProjectShared ? "shared" : "my-projects");
  }, [currentProjectId, isCurrentProjectShared]);

  return (
    <>
      {/* Backdrop (closes sidebar on outside click, floats above canvas but below sidebar) */}
      <div
        className={cn(
          "absolute inset-0 bg-background/40 backdrop-blur-xs z-30 transition-opacity duration-300 pointer-events-none opacity-0",
          isOpen && "pointer-events-auto opacity-100",
        )}
        onClick={onClose}
      />

      {/* Sidebar Shell Container */}
      <aside
        className={cn(
          "absolute top-0 left-0 h-full w-[320px] bg-card/90 backdrop-blur-md border-r border-border z-40",
          "flex flex-col shadow-2xl transition-all duration-300 ease-in-out select-none",
          isOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none",
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 p-4"
        >
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
            <ScrollArea className="flex-1">
              {ownedProjects.length > 0 ? (
                <div className="space-y-2 pr-4">
                  {ownedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/editor/${project.id}`}
                      onClick={onClose}
                      className={cn(
                        "group relative block p-3 rounded-xl border transition-colors flex items-center justify-between",
                        currentProjectId === project.id
                          ? "bg-duo-green/10 border-duo-green/50 text-text-primary"
                          : "bg-bg-elevated border-border hover:border-duo-green/50 text-text-secondary group-hover:text-text-primary",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FolderGit2
                          className={cn(
                            "size-4 transition-colors",
                            currentProjectId === project.id
                              ? "text-duo-green"
                              : "text-text-muted group-hover:text-duo-green",
                          )}
                        />
                        <span
                          className={cn(
                            "text-caption font-medium font-din-round uppercase tracking-wide",
                            currentProjectId === project.id
                              ? "text-text-primary"
                              : "text-text-secondary group-hover:text-text-primary",
                          )}
                        >
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
                            e.preventDefault();
                            openDialog("rename", project.id, project.name);
                            console.log("Edit");
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
                            e.preventDefault();
                            openDialog("delete", project.id);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center p-6 text-center space-y-4">
                  <div className="p-4 bg-bg-elevated rounded-2xl text-text-muted border border-border">
                    <FolderGit2 className="size-10 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-body font-bold text-text-primary font-din-round tracking-wide uppercase">
                      No projects yet
                    </h3>
                    <p className="text-caption text-text-muted max-w-[220px] font-din-round">
                      Create a new system design architecture to start
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Shared Projects List */}
          <TabsContent
            value="shared"
            className="flex-1 flex flex-col gap-2 mt-4 outline-none"
          >
            <ScrollArea className="flex-1">
              {sharedProjects.length > 0 ? (
                <div className="space-y-2 pr-4">
                  {sharedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/editor/${project.id}`}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          onClose();
                        }
                      }}
                      className={cn(
                        "group relative block p-3 rounded-xl border transition-colors flex items-center justify-between",
                        currentProjectId === project.id
                          ? "bg-sky-blue/10 border-sky-blue/50 text-text-primary"
                          : "bg-bg-elevated border-border hover:border-sky-blue/50 text-text-secondary group-hover:text-text-primary",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Users
                          className={cn(
                            "size-4 transition-colors",
                            currentProjectId === project.id
                              ? "text-sky-blue"
                              : "text-text-muted group-hover:text-sky-blue",
                          )}
                        />
                        <span
                          className={cn(
                            "text-caption font-medium font-din-round uppercase tracking-wide",
                            currentProjectId === project.id
                              ? "text-text-primary"
                              : "text-text-secondary group-hover:text-text-primary",
                          )}
                        >
                          {project.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center p-6 text-center space-y-4">
                  <div className="p-4 bg-bg-elevated rounded-2xl text-text-muted border border-border">
                    <Users className="size-10 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-body font-bold text-text-primary font-din-round tracking-wide uppercase">
                      No shared projects
                    </h3>
                    <p className="text-caption text-text-muted max-w-[220px] font-din-round">
                      Projects shared with you will appear here
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer - Create New Project Button */}
        <div className="border-t border-border p-4 shrink-0">
          <Button
            onClick={() => openDialog("create")}
            variant="primary3d"
            className="w-full py-3 px-4 rounded-xl text-sm font-medium"
          >
            <Plus className="size-4 stroke-[2.5]" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
