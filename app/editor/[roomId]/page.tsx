import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProjectWithAccess } from "@/lib/project-access";
import { fetchUserProjects } from "@/lib/project-helpers";
import WorkspaceLayout from "@/components/editor/workspace-layout";
import AccessDenied from "@/components/editor/access-denied";
import ClientCanvas from "@/components/editor/ClientCanvas";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
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
      roomId={roomId}
    >
      <div className="h-full w-full">
        <ClientCanvas roomId={roomId} />
      </div>
    </WorkspaceLayout>
  );
}
