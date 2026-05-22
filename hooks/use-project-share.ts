import { useState, useEffect, useCallback } from "react";
import { Collaborator } from "@/lib/project-collaborators";

interface UseProjectShareReturn {
  collaborators: Collaborator[];
  isLoading: boolean;
  error: string | null;
  inviteCollaborator: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  removeCollaborator: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  inviteLoading: boolean;
  removingEmail: string | null;
  refreshCollaborators: () => Promise<void>;
}

export function useProjectShare(projectId: string): UseProjectShareReturn {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const refreshCollaborators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) {
        throw new Error(`Failed to fetch collaborators: ${res.statusText}`);
      }
      const data = await res.json();
      setCollaborators(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching collaborators");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      refreshCollaborators();
    }
  }, [projectId, refreshCollaborators]);

  const inviteCollaborator = async (email: string) => {
    setInviteLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to invite collaborator");
      }

      await refreshCollaborators();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setInviteLoading(false);
    }
  };

  const removeCollaborator = async (email: string) => {
    setRemovingEmail(email);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove collaborator");
      }

      await refreshCollaborators();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setRemovingEmail(null);
    }
  };

  return {
    collaborators,
    isLoading,
    error,
    inviteCollaborator,
    removeCollaborator,
    inviteLoading,
    removingEmail,
    refreshCollaborators,
  };
}
