import { Bot, FileCode, PanelRight, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AiAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistantSidebar({
  isOpen,
  onClose,
}: AiAssistantSidebarProps) {
  return (
    <aside
      className={cn(
        "absolute top-0 right-0 z-50 flex h-full w-[320px] flex-col border-l border-border bg-card/90 backdrop-blur-md shadow-2xl",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none",
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-text-primary" />
            <span className="font-feather text-heading-sm text-text-primary uppercase tracking-wider">
              AI Workspace
            </span>
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

        <TabsContent value="architect" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center rounded-2xl text-text-muted">
                <Sparkles className="size-[34px] stroke-[1.5]" />
              </div>
              <p className="max-w-[220px] font-din-round text-caption text-text-muted">
                I can help you design architectures, suggest patterns, and generate specs.
              </p>
              <div className="flex flex-col gap-2 w-full pt-4">
                {[
                  "Design an e-commerce backend",
                  "Create a chat app architecture",
                  "Build a CI/CD pipeline"
                ].map((prompt) => (
                  <button 
                    key={prompt}
                    className="text-left px-3 py-2 rounded-lg bg-bg-subtle hover:bg-bg-elevated text-accent-text border border-transparent hover:border-border transition-colors text-xs font-medium cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            {/* Example user message */}
            <div className="self-end max-w-[85%] rounded-xl px-3 py-2 text-sm bg-brand-dim border-brand/50 border-2 text-copy-primary">
              Hello, how can you help me?
            </div>
            {/* Example bot message */}
            <div className="self-start max-w-[85%] rounded-xl px-3 py-2 text-sm border border-surface-border text-accent-text bg-bg-elevated">
              I can help you build system architectures. Just ask!
            </div>
          </div>
          
          <div className="p-4 pt-0">
            <div className="relative border border-border rounded-xl bg-bg-elevated focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all">
              <Textarea 
                placeholder="Ask Ghost AI..."
                className="min-h-[72px] max-h-[160px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm py-3 pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Submit
                  }
                }}
              />
              <Button 
                size="icon" 
                className="absolute bottom-2 right-2 size-8 bg-accent text-white hover:bg-accent/90 rounded-lg cursor-pointer"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="flex-1 flex flex-col p-4 m-0 data-[state=inactive]:hidden">
          <Button className="w-full bg-accent text-white hover:bg-accent/90 mb-6 cursor-pointer">
            Generate Spec
          </Button>
          
          <div className="space-y-4 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Generated Specs</h3>
            
            <div className="rounded-xl border border-border bg-bg-elevated p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-text-primary">
                  <FileCode className="size-4 text-accent-text" />
                  <span className="text-sm font-medium">System_Architecture.md</span>
                </div>
              </div>
              <p className="text-xs text-text-muted line-clamp-2">
                # System Architecture
                This document outlines the core components and data flow...
              </p>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs cursor-not-allowed opacity-50" disabled>
                  Download
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
