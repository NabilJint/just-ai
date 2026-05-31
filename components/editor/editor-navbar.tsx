"use client";

import React from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  MessageCircle,
  Share2,
  LayoutTemplate,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import {
  useCanvasSaveStatus,
  type CanvasSaveStatus,
} from "@/hooks/use-canvas-save-status";

function saveStatusLabel(status: CanvasSaveStatus) {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed";
    default:
      return "Save";
  }
}

function SaveStatusIcon({ status }: { status: CanvasSaveStatus }) {
  if (status === "saving") {
    return <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />;
  }

  if (status === "saved") {
    return <Check className="size-4 mr-2" aria-hidden="true" />;
  }

  if (status === "error") {
    return <AlertCircle className="size-4 mr-2" aria-hidden="true" />;
  }

  return <Save className="size-4 mr-2" aria-hidden="true" />;
}

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  onToggleAiChat?: () => void;
  onShare?: () => void;
  onOpenTemplates?: () => void;
}

export default function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName = "Untitled System Design",
  onToggleAiChat,
  onShare,
  onOpenTemplates,
}: EditorNavbarProps) {
  const { status: saveStatus } = useCanvasSaveStatus();

  return (
    <header className="h-14 w-full flex items-center justify-between px-4 border-b border-border bg-card select-none shrink-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer size-9"
          title={
            isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"
          }
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeftOpen className="size-5" />
          )}
        </Button>
        <span className="font-feather text-heading-sm text-primary flex items-center gap-2 select-none uppercase tracking-wide">
          <img
            src="/favicon.png"
            alt="Ghost AI Logo"
            className="size-5 rounded-md"
          />
          {/* Ghost AI */}
        </span>
      </div>

      {/* Center Section */}
      <div className="flex items-center">
        <span className="text-caption text-text-muted font-din-round tracking-wider uppercase font-semibold">
          {projectName}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          disabled
          className="text-text-secondary rounded-xl cursor-default h-9 px-3 disabled:opacity-100"
          title={saveStatusLabel(saveStatus)}
          aria-live="polite"
        >
          <SaveStatusIcon status={saveStatus} />
          <span className="text-sm font-medium">{saveStatusLabel(saveStatus)}</span>
        </Button>
        {onOpenTemplates && (
          <Button
            variant="ghost"
            onClick={onOpenTemplates}
            className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer h-9 px-3"
            title="Starter Templates"
          >
            <LayoutTemplate className="size-4 mr-2" />
            <span className="text-sm font-medium">Templates</span>
          </Button>
        )}
        {onToggleAiChat && (
          <Button
            variant="ghost"
            onClick={onToggleAiChat}
            className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer h-9 px-3"
            title="Toggle AI assistant"
          >
            <MessageCircle className="size-4 mr-2" />
            <span className="text-sm font-medium">AI</span>
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            onClick={onShare}
            className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer h-9 px-3"
            title="Share project"
          >
            <Share2 className="size-4 mr-2" />
            <span className="text-sm font-medium">Share</span>
          </Button>
        )}
       
      </div>
    </header>
  );
}
