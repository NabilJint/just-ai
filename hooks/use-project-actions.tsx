"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export type DialogType = "create" | "rename" | "delete";

interface ProjectActionState {
  activeDialog: DialogType | null;
  projectName: string;
  projectSlug: string;
  targetProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseProjectActionsResult {
  activeDialog: DialogType | null;
  projectName: string;
  projectSlug: string;
  targetProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  openDialog: (
    type: DialogType,
    projectId?: string,
    currentName?: string,
  ) => void;
  closeDialog: () => void;
  updateProjectName: (name: string) => void;
  confirmCreate: () => Promise<void>;
  confirmRename: () => Promise<void>;
  confirmDelete: () => Promise<void>;
}

export function useProjectActions(): UseProjectActionsResult {
  const router = useRouter();
  const [state, setState] = useState<ProjectActionState>({
    activeDialog: null,
    projectName: "",
    projectSlug: "",
    targetProjectId: null,
    isLoading: false,
    error: null,
  });

  const slugify = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const openDialog = useCallback(
    (type: DialogType, projectId?: string, currentName?: string) => {
      const name = currentName || "";
      setState((prev) => ({
        ...prev,
        activeDialog: type,
        projectName: name,
        projectSlug: slugify(name),
        targetProjectId: projectId || null,
        error: null,
      }));
    },
    [slugify],
  );

  const closeDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeDialog: null,
      projectName: "",
      projectSlug: "",
      targetProjectId: null,
      error: null,
    }));
  }, []);

  const updateProjectName = useCallback(
    (name: string) => {
      setState((prev) => ({
        ...prev,
        projectName: name,
        projectSlug: slugify(name),
      }));
    },
    [slugify],
  );

  const confirmCreate = useCallback(async () => {
    if (!state.projectName.trim()) {
      setState((prev) => ({ ...prev, error: "Project name is required" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.projectName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();
      setState((prev) => ({ ...prev, isLoading: false }));
      closeDialog();
      router.push(`/editor/${project.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [state.projectName, closeDialog, router]);

  const confirmRename = useCallback(async () => {
    if (!state.projectName.trim()) {
      setState((prev) => ({ ...prev, error: "Project name is required" }));
      return;
    }

    if (!state.targetProjectId) {
      setState((prev) => ({ ...prev, error: "No project selected" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/projects/${state.targetProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.projectName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      closeDialog();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [state.projectName, state.targetProjectId, closeDialog, router]);

  const confirmDelete = useCallback(async () => {
    if (!state.targetProjectId) {
      setState((prev) => ({ ...prev, error: "No project selected" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/projects/${state.targetProjectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      closeDialog();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [state.targetProjectId, closeDialog, router]);

  return {
    activeDialog: state.activeDialog,
    projectName: state.projectName,
    projectSlug: state.projectSlug,
    targetProjectId: state.targetProjectId,
    isLoading: state.isLoading,
    error: state.error,
    openDialog,
    closeDialog,
    updateProjectName,
    confirmCreate,
    confirmRename,
    confirmDelete,
  };
}
