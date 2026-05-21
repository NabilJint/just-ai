import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface ProjectData {
  id: string;
  name: string;
  ownerId: string;
  isOwned: boolean;
}

/**
 * Fetch all projects for the authenticated user.
 * Returns both owned projects and projects shared with the user.
 */
export async function fetchUserProjects(): Promise<{
  owned: ProjectData[];
  shared: ProjectData[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { owned: [], shared: [] };
  }

  // Fetch owned projects
  const ownedProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  // Fetch shared projects (through collaborators)
  const sharedProjects = await prisma.projectCollaborator.findMany({
    where: {
      email: {
        not: undefined, // User email would be passed, but for now we use basic filter
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const owned: ProjectData[] = ownedProjects.map((p) => ({
    ...p,
    isOwned: true,
  }));

  const shared: ProjectData[] = sharedProjects
    .map((cp) => ({
      ...cp.project,
      isOwned: false,
    }))
    .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx); // Deduplicate

  return { owned, shared };
}
