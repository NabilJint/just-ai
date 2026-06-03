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

  // Fetch shared projects through collaborator email OR userId.
  // Using both ensures projects are found even when the invited email
  // differs from the user's current primary email.
  const sharedCollaborators = await prisma.projectCollaborator.findMany({
    where: {
      OR: await buildSharedProjectFilter(userId),
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

  const shared: ProjectData[] = sharedCollaborators
    .map((cp) => ({
      ...cp.project,
      isOwned: false,
    }))
    .filter((p) => p.ownerId !== userId)
    .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx);

  return { owned, shared };
}

/**
 * Build the OR filter for finding shared projects: always match by userId,
 * and also try the user's current email as a fallback.
 */
export async function buildSharedProjectFilter(userId: string) {
  const conditions: { userId?: string; email?: string }[] = [{ userId }];
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    if (email) {
      conditions.push({ email });
    }
  } catch (error) {
    console.error("Failed to fetch Clerk user email for shared projects", error);
  }
  return conditions;
}

