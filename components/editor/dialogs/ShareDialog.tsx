"use client";

import React, { useEffect, useState } from "react";
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
import { Copy, UserPlus, UserMinus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
}

export default function ShareDialog({
  open,
  onOpenChange,
  project,
}: ShareDialogProps) {
  const { user } = useUser();
  const isOwner = !!user && user.id === project?.ownerId;

  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleInvite = () => {
    if (!inviteEmail) return;
    setError(null);
    setLoading(true);
    fetch(`/api/projects/${project.id}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    })
      .then(async (res) => {
        setLoading(false);
        if (res.ok) {
          const data = await res.json();
          setCollaborators((s) => [...s, data]);
          setInviteEmail("");
        } else {
          const body = await res.json().catch(() => ({}));
          setError(body?.error || "Invite failed");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Invite failed");
      });
  };

  const handleRemove = (email: string) => {
    setError(null);
    setLoading(true);
    fetch(`/api/projects/${project.id}/collaborators`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        setLoading(false);
        if (res.ok) {
          setCollaborators((s) => s.filter((c) => c.email !== email));
        } else {
          const body = await res.json().catch(() => ({}));
          setError(body?.error || "Remove failed");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Remove failed");
      });
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/projects/${project.id}/collaborators`)
      .then(async (res) => {
        setLoading(false);
        if (res.ok) {
          const data = await res.json();
          setCollaborators(data || []);
        } else {
          const body = await res.json().catch(() => ({}));
          setError(body?.error || "Failed to load collaborators");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Failed to load collaborators");
      });
  }, [open, project?.id]);

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
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-xl h-11 bg-bg-elevated border-border text-text-primary placeholder:text-text-muted/50"
              />
              <Button
                onClick={handleInvite}
                disabled={!isOwner || !inviteEmail}
                className="rounded-xl"
                variant="ghost"
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
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

          <div>
            <label className="text-caption font-bold text-text-primary uppercase tracking-wider font-din-round">
              Collaborators
            </label>
            <div className="mt-2 p-3 bg-bg-elevated rounded-2xl border border-border">
              {loading && (
                <div className="text-caption text-text-muted">
                  Loading collaborators...
                </div>
              )}
              {error && (
                <div className="text-caption text-red-500">{error}</div>
              )}
              {!loading && collaborators.length === 0 && (
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

              {!loading && collaborators.length > 0 && (
                <div className="space-y-3">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.displayName || c.email}
                            className="size-8 rounded-full"
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-bg-muted" />
                        )}
                        <div>
                          <div className="text-body text-text-primary">
                            {c.displayName || c.email}
                          </div>
                          <div className="text-caption text-text-muted">
                            {c.email}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!isOwner}
                          onClick={() => handleRemove(c.email)}
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
