"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, PanelRight, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDesignAgent } from "@/hooks/use-design-agent";
import { useAiRoomContext } from "@/hooks/use-ai-room-context";
import { useEventListener, useBroadcastEvent, useSelf } from "@liveblocks/react";
import type { AiChatFeedPayload } from "@/types/tasks";
import SpecsTabContent from "@/components/editor/specs-tab-content";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

interface AiAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  roomId: string;
}

export default function AiAssistantSidebar({
  isOpen,
  onClose,
  projectId,
  roomId,
}: AiAssistantSidebarProps) {
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState<AiChatFeedPayload[]>([]);
  const processedRunIds = useRef(new Set<string>());
  const self = useSelf();
  const broadcast = useBroadcastEvent();

  const {
    submitPrompt,
    isRunning,
    submitError,
    run,
    runStatusMessage,
    resetRun,
  } = useDesignAgent({ projectId, roomId });
  const { isAiRunning: roomAiRunning, latestStatus: roomStatus } = useAiRoomContext();

  useEventListener(({ event }) => {
    if (event.type === "ai-chat") {
      const payload: AiChatFeedPayload = {
        sender: event.sender,
        role: event.role,
        content: event.content,
        timestamp: event.at,
      };
      setChatMessages((prev) => [...prev, payload]);
    }
  });

  const isGenerating = isRunning || roomAiRunning;

  const pushChatMessage = useCallback(
    (msg: AiChatFeedPayload) => {
      const { timestamp, ...rest } = msg;
      broadcast({ type: "ai-chat", ...rest, at: timestamp });
      setChatMessages((prev) => [...prev, msg]);
    },
    [broadcast],
  );

  const handleSubmit = useCallback(async () => {
    const value = input.trim();
    if (!value) return;
    setInput("");

    const userMsg: AiChatFeedPayload = {
      sender: self?.info?.displayName || "Unknown",
      role: "user",
      content: value,
      timestamp: Date.now(),
    };
    pushChatMessage(userMsg);

    try {
      await submitPrompt(value);
    } catch (e) {
      const errorMsg: AiChatFeedPayload = {
        sender: "Ghost AI",
        role: "assistant",
        content: `Error: ${e instanceof Error ? e.message : "Something went wrong"}`,
        timestamp: Date.now(),
      };
      pushChatMessage(errorMsg);
    }
  }, [input, submitPrompt, pushChatMessage, self]);

  const handleStarterClick = useCallback(
    (prompt: string) => {
      const userMsg: AiChatFeedPayload = {
        sender: self?.info?.displayName || "Unknown",
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };
      pushChatMessage(userMsg);
      void submitPrompt(prompt);
    },
    [submitPrompt, pushChatMessage, self],
  );

  useEffect(() => {
    if (!run || processedRunIds.current.has(run.id)) return;

    if (run.status === "COMPLETED") {
      processedRunIds.current.add(run.id);
      const logs = run.metadata?.logs;
      const lastLog = Array.isArray(logs) ? String(logs.at(-1) ?? "") : "";
      const completionText =
        lastLog ||
        `Applied ${(run.output as { applied?: number })?.applied ?? 0} update${(run.output as { applied?: number })?.applied === 1 ? "" : "s"} to the canvas.`;

      const aiMsg: AiChatFeedPayload = {
        sender: "Ghost AI",
        role: "assistant",
        content: completionText,
        timestamp: Date.now(),
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      pushChatMessage(aiMsg);
      resetRun();
    }

    if (run.status === "FAILED") {
      processedRunIds.current.add(run.id);
      const errorMsg: AiChatFeedPayload = {
        sender: "Ghost AI",
        role: "assistant",
        content: `The design task failed.`,
        timestamp: Date.now(),
      };
      pushChatMessage(errorMsg);
      resetRun();
    }

    if (run.status === "CANCELED" || run.status === "TIMED_OUT" || run.status === "CRASHED" || run.status === "SYSTEM_FAILURE") {
      processedRunIds.current.add(run.id);
      const errorMsg: AiChatFeedPayload = {
        sender: "Ghost AI",
        role: "assistant",
        content: `The design task ended with status: ${run.status}.`,
        timestamp: Date.now(),
      };
      pushChatMessage(errorMsg);
      resetRun();
    }
  }, [run, pushChatMessage, resetRun]);

  const showEmptyState = chatMessages.length === 0 && !isGenerating;

  return (
    <aside
      className={cn(
        "absolute top-0 right-0 z-50 flex h-full w-[320px] flex-col border-l border-border bg-card/90 backdrop-blur-md shadow-2xl",
        "transition-all duration-300 ease-in-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 pointer-events-none",
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-text-primary" />
            <span className="font-feather text-heading-sm text-text-primary uppercase tracking-wider">
              AI Workspace
            </span>
            {isGenerating && (
              <span className="flex items-center gap-1 rounded-full border border-accent-ai/30 bg-accent-ai/10 px-2 py-0.5 text-[10px] font-medium text-accent-ai-text uppercase tracking-wider">
                <Loader2 className="size-2.5 animate-spin" />
                Thinking
              </span>
            )}
          </div>
          <span className="text-[10px] text-text-muted uppercase tracking-widest">
            Collaborate with Ghost AI
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 cursor-pointer rounded-xl text-text-secondary hover:text-text-primary shrink-0"
        >
          <PanelRight className="size-4" />
        </Button>
      </div>

      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-2 p-1 bg-bg-elevated border border-border rounded-lg">
            <TabsTrigger
              value="architect"
              className="rounded-md data-[state=active]:bg-accent data-[state=active]:text-white text-text-muted"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-md data-[state=active]:bg-accent data-[state=active]:text-white text-text-muted"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="architect"
          className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {showEmptyState ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="mx-auto flex items-center justify-center rounded-2xl text-text-muted">
                  <Sparkles className="size-[34px] stroke-[1.5]" />
                </div>
                <p className="max-w-[220px] text-caption text-text-muted">
                  I can help you design architectures, suggest patterns, and
                  generate specs.
                </p>
                <div className="flex flex-col gap-2 w-full pt-4">
                  {STARTER_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="ghost"
                      disabled={isGenerating}
                      onClick={() => handleStarterClick(prompt)}
                      className="w-full justify-start text-left px-3 py-2 rounded-lg text-xs font-medium border border-transparent hover:border-border"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {chatMessages.map((message, idx) => (
                  <div
                    key={`${message.timestamp}-${idx}`}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.role === "user"
                        ? "self-end bg-node-palette-green-text text-white"
                        : "self-start bg-bg-elevated text-text-primary border border-border",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      {message.role === "assistant" && (
                        <span className="text-[10px] font-bold text-accent-ai-text uppercase tracking-wider">
                          {message.sender}
                        </span>
                      )}
                      {message.role === "user" && (
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                          {message.sender}
                        </span>
                      )}
                      <div>{message.content}</div>
                    </div>
                  </div>
                ))}
                {isGenerating && runStatusMessage && (
                  <div className="self-start flex items-center gap-2 max-w-[85%] rounded-xl px-3 py-2 text-sm border border-accent-ai/30 text-accent-ai-text bg-bg-elevated">
                    <Loader2 className="size-3.5 animate-spin shrink-0" />
                    {runStatusMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 pt-0 space-y-2">
            {isGenerating && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface border border-border">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-node-palette-green-text opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-node-palette-green-text" />
                </span>
                <span className="text-xs text-text-secondary">
                  {roomStatus?.text || runStatusMessage || "AI is working..."}
                </span>
              </div>
            )}
            <div className="relative border border-border rounded-xl bg-bg-elevated focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all">
              <Textarea
                placeholder="Ask Ghost AI..."
                value={input}
                disabled={isGenerating}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[72px] max-h-[160px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm py-3 pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                disabled={isGenerating || !input.trim()}
                onClick={() => void handleSubmit()}
                className={cn(
                  "absolute bottom-2 right-2 size-8 rounded-lg cursor-pointer",
                  isGenerating || !input.trim()
                    ? "bg-node-palette-green-text/40 text-white/40 cursor-not-allowed"
                    : "bg-node-palette-green-text text-white hover:bg-node-palette-green-text/90",
                )}
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="specs"
          className="flex-1 flex flex-col p-4 m-0 data-[state=inactive]:hidden"
        >
          <SpecsTabContent projectId={projectId} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
