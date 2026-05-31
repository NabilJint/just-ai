import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <Lock className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-xs">
          You don&apos;t have permission to access this project or the project no longer exists.
        </p>
        <div className="pt-4">
          <Button asChild variant="outline">
            <Link href="/editor">
              Return to Editor
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
