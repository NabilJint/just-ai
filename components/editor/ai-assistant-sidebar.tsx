import { PanelRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        "absolute top-0 right-0 z-40 flex h-full w-[320px] flex-col border-l border-border bg-card/90 backdrop-blur-md shadow-2xl",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none",
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="font-feather text-heading-sm text-text-primary uppercase tracking-wider">
          AI Assistant
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 cursor-pointer rounded-xl text-text-secondary hover:text-text-primary"
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border bg-bg-elevated text-text-muted">
            <Sparkles className="size-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-din-round text-body font-bold uppercase tracking-wide text-text-primary">
              AI Contextual Help
            </h3>
            <p className="max-w-[220px] font-din-round text-caption text-text-muted">
              The AI assistant will appear here to help you build your
              architecture.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
