"use client";

import React from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  onToggleAiChat?: () => void;
  onShare?: () => void;
}

export default function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName = "Untitled System Design",
  onToggleAiChat,
  onShare,
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
          Ghost AI
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
        {onToggleAiChat && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAiChat}
            className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer size-9"
            title="Toggle AI assistant"
          >
            <MessageCircle className="size-5" />
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="text-text-secondary hover:text-text-primary rounded-xl cursor-pointer size-9"
            title="Share project"
          >
            <Share2 className="size-5" />
          </Button>
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8 rounded-xl border border-border",
              userButtonTrigger:
                "rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-duo-green",
            },
          }}
        />
      </div>
    </header>
  );
}
