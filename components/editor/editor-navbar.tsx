"use client"

import React from "react"
import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: EditorNavbarProps) {
  return (
    <header className="h-14 w-full flex items-center justify-between px-4 border-b border-border bg-card select-none shrink-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer size-9"
          title={isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeftOpen className="size-5" />
          )}
        </Button>
        <span className="font-feather text-heading-sm text-primary flex items-center gap-2 select-none uppercase tracking-wide">
          <span className="text-duo-green">●</span> Ghost AI
        </span>
      </div>

      {/* Center Section */}
      <div className="flex items-center">
        <span className="text-caption text-text-muted font-din-round tracking-wider uppercase font-semibold">
          Untitled System Design
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Intentionally left empty per specs for future actions */}
      </div>
    </header>
  )
}
