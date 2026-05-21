import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProjectWithAccess } from "@/lib/project-access";
import { fetchUserProjects } from "@/lib/project-helpers";
import WorkspaceLayout from "@/components/editor/workspace-layout";
import AccessDenied from "@/components/editor/access-denied";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const project = await getProjectWithAccess(roomId);

  if (!project) {
    return <AccessDenied />;
  }

  const { owned, shared } = await fetchUserProjects();

  return (
    <WorkspaceLayout
      project={project}
      ownedProjects={owned}
      sharedProjects={shared}
    >
      <div className="flex h-full w-full items-center justify-center bg-black/20 text-text-muted">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-6 rounded-full bg-bg-elevated border border-border">
            <span className="text-4xl">🎨</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text-primary font-din-round uppercase tracking-wide">
              Canvas Placeholder
            </h2>
            <p className="text-caption max-w-xs font-din-round">
              The collaborative canvas implementation will be integrated here in Phase 3.
            </p>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
