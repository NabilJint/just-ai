"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type DialogType = "create" | "rename" | "delete"

interface ProjectDialogState {
  activeDialog: DialogType | null
  projectName: string
  projectSlug: string
  targetProjectId: string | null
  isLoading: boolean
  error: string | null
}

interface ProjectDialogContextValue {
  activeDialog: DialogType | null
  projectName: string
  projectSlug: string
  targetProjectId: string | null
  isLoading: boolean
  error: string | null
  openDialog: (type: DialogType, projectId?: string, currentName?: string) => void
  closeDialog: () => void
  updateProjectName: (name: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const ProjectDialogContext = createContext<ProjectDialogContextValue | undefined>(undefined)

export function ProjectDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProjectDialogState>({
    activeDialog: null,
    projectName: "",
    projectSlug: "",
    targetProjectId: null,
    isLoading: false,
    error: null,
  })

  const slugify = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, [])

  const openDialog = useCallback((type: DialogType, projectId?: string, currentName?: string) => {
    const name = currentName || "";
    setState((prev) => ({
      ...prev,
      activeDialog: type,
      projectName: name,
      projectSlug: slugify(name),
      targetProjectId: projectId || null,
      error: null,
    }))
  }, [slugify])

  const closeDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeDialog: null,
      projectName: "",
      projectSlug: "",
      targetProjectId: null,
      error: null,
    }))
  }, [])

  const updateProjectName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      projectName: name,
      projectSlug: slugify(name),
    }))
  }, [slugify])

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  return (
    <ProjectDialogContext.Provider
      value={{
        ...state,
        openDialog,
        closeDialog,
        updateProjectName,
        setLoading,
        setError,
      }}
    >
      {children}
    </ProjectDialogContext.Provider>
  )
}

export function useProjectDialogs() {
  const context = useContext(ProjectDialogContext)
  if (context === undefined) {
    throw new Error("useProjectDialogs must be used within a ProjectDialogProvider")
  }
  return context
}
