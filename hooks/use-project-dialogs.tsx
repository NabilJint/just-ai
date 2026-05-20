"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type DialogType = "create" | "rename" | "delete"

interface ProjectDialogState {
  activeDialog: DialogType | null
  projectName: string
  projectSlug: string
  isLoading: boolean
}

interface ProjectDialogContextValue {
  activeDialog: DialogType | null
  projectName: string
  projectSlug: string
  isLoading: boolean
  openDialog: (type: DialogType, initialName?: string) => void
  closeDialog: () => void
  updateProjectName: (name: string) => void
  confirmProjectAction: () => Promise<void>
}

const ProjectDialogContext = createContext<ProjectDialogContextValue | undefined>(undefined)

export function ProjectDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProjectDialogState>({
    activeDialog: null,
    projectName: "",
    projectSlug: "",
    isLoading: false,
  })

  const openDialog = useCallback((type: DialogType, initialName: string = "") => {

      
    setState((prev) => ({
      ...prev,
      activeDialog: type,
      projectName: initialName,
      projectSlug: initialName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }))
  }, [])

  const closeDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeDialog: null,
      projectName: "",
      projectSlug: "",
    }))
  }, [])

  const updateProjectName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      projectName: name,
      projectSlug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }))
  }, [])

  const confirmProjectAction = useCallback(async () => {
    if (!state.projectSlug) return

    setState((prev) => ({ ...prev, isLoading: true }))
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setState((prev) => ({ ...prev, isLoading: false }))
    closeDialog()
  }, [closeDialog])

  return (
    <ProjectDialogContext.Provider
      value={{
        ...state,
        openDialog,
        closeDialog,
        updateProjectName,
        confirmProjectAction,
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
