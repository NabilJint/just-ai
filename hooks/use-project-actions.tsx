"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectDialogs } from "./use-project-dialogs";

export interface UseProjectActionsResult {
  confirmCreate: () => Promise<void>;
  confirmRename: () => Promise<void>;
  confirmDelete: () => Promise<void>;
}

export function useProjectActions(): UseProjectActionsResult {
  const router = useRouter();
  const {
    projectName,
    targetProjectId,
    setLoading,
    setError,
    closeDialog
  } = useProjectDialogs();

  const confirmCreate = useCallback(async () => {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();
      setLoading(false);
      closeDialog();
      router.push(`/editor/${project.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setLoading(false);
      setError(message);
    }
  }, [projectName, setLoading, setError, closeDialog, router]);

  const confirmRename = useCallback(async () => {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    if (!targetProjectId) {
      setError("No project selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${targetProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      setLoading(false);
      closeDialog();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setLoading(false);
      setError(message);
    }
  }, [projectName, targetProjectId, setLoading, setError, closeDialog, router]);

  const confirmDelete = useCallback(async () => {
    if (!targetProjectId) {
      setError("No project selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${targetProjectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setLoading(false);
      closeDialog();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setLoading(false);
      setError(message);
    }
  }, [targetProjectId, setLoading, setError, closeDialog, router]);

  return {
    confirmCreate,
    confirmRename,
    confirmDelete,
  };
}
