"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus, UserMinus, UserRound } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useProjectShare } from "@/hooks/use-project-share";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getProfileInitial(name: string | null, email: string) {
  return (name?.trim()[0] ?? email.trim()[0] ?? "?").toUpperCase();
}

interface ShareProject {
  id: string;
  ownerId: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ShareProject;
}

export default function ShareDialog({
  open,
  onOpenChange,
  project,
}: ShareDialogProps) {
  const { user } = useUser();
  const isOwner = !!user && user.id === project?.ownerId;

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    collaborators,
    isLoading,
    error,
    inviteCollaborator,
    removeCollaborator,
    inviteLoading,
    removingEmail,
  } = useProjectShare(project.id);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/editor/${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();

    if (!email) return;

    if (!EMAIL_PATTERN.test(email)) {
      setInviteError("Enter a valid email address.");
      return;
    }

    const result = await inviteCollaborator(email);
    if (result.success) {
      setInviteEmail("");
      setInviteError("");
      return;
    }

    if (result.error) {
      setInviteError(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl p-6 gap-6 overflow-hidden">
        <DialogHeader className="space-y-3">
          <DialogTitle className="font-feather text-heading-sm text-text-primary uppercase tracking-wide">
            Share Project
          </DialogTitle>
          <DialogDescription className="font-din-round text-caption text-text-muted">
            Invite collaborators by email, view current collaborators, or copy a
            project link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-caption font-bold text-text-primary uppercase tracking-wider font-din-round">
              Invite by Email
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="alice@example.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError("");
                }}
                className="rounded-xl h-11 bg-bg-elevated border-border text-text-primary placeholder:text-text-muted/50"
              />
              <Button
                onClick={handleInvite}
                disabled={!isOwner || !inviteEmail.trim() || inviteLoading}
                className="rounded-xl"
                variant="ghost"
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
            {inviteError && (
              <p className="text-caption text-state-error">{inviteError}</p>
            )}
            {!isOwner && (
              <p className="text-caption text-text-muted">
                Only owners can invite collaborators.
              </p>
            )}
          </div>

          <div className="p-3 bg-bg-elevated rounded-2xl border border-border flex items-center justify-between">
            <span className="text-caption font-medium text-text-muted font-din-round uppercase tracking-tight">
              Project Link
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-caption text-text-primary truncate max-w-[220px]">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/editor/${project.id}`
                  : `...`}
              </span>
              <Button
                onClick={handleCopyLink}
                className="rounded-xl"
                variant="ghost"
              >
                <Copy className="size-4" />
              </Button>
              {copied && (
                <span className="text-caption text-duo-green">Copied!</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-caption font-bold text-text-primary uppercase tracking-wider font-din-round">
              Collaborators
            </label>
            <div className="mt-2 p-3 bg-bg-elevated rounded-2xl border border-border">
              {isLoading && (
                <div className="text-caption text-text-muted">
                  Loading collaborators...
                </div>
              )}
              {error && (
                <div className="text-caption text-red-500">{error}</div>
              )}
              {!isLoading && collaborators.length === 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-bg-muted" />
                    <div>
                      <div className="text-body text-text-primary">
                        No collaborators yet
                      </div>
                      <div className="text-caption text-text-muted">
                        Invite collaborators to share this project
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" disabled>
                      <UserMinus className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {!isLoading && collaborators.length > 0 && (
                <div className="space-y-3">
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.displayName || c.email}
                            className="size-13 shrink-0 rounded-full border border-border-subtle object-cover"
                          />
                        ) : (
                          <div className="flex size-13 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-accent-dim text-text-brand">
                            <span className="sr-only">
                              {c.displayName || c.email}
                            </span>
                            {c.displayName || c.email ? (
                              <span className="font-din-round text-body font-bold">
                                {getProfileInitial(c.displayName, c.email)}
                              </span>
                            ) : (
                              <UserRound className="size-5" aria-hidden="true" />
                            )}
                          </div>
                        )}
                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-body text-text-primary">
                              {c.displayName || c.email}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter font-din-round",
                                c.role === "owner"
                                  ? "bg-duo-green/20 text-duo-green"
                                  : "bg-bg-muted text-text-muted",
                              )}
                            >
                              {c.role}
                            </span>
                          </div>
                          <div className="text-caption text-text-muted">
                            {c.email}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            !isOwner ||
                            c.role === "owner" ||
                            removingEmail === c.email
                          }
                          onClick={() => removeCollaborator(c.email)}
                        >
                          <UserMinus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-text-secondary hover:text-text-primary font-din-round uppercase tracking-wider text-caption"
          >
            Close
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-duo-green text-bg-base font-bold rounded-xl px-6"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
