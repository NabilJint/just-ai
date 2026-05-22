import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getProjectAccess() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { userId: null, email: null };
  }

  return {
    userId,
    email: user.emailAddresses[0]?.emailAddress || null,
  };
}

export async function checkProjectAccess(projectId: string) {
  const { userId, email } = await getProjectAccess();

  if (!userId) return false;

  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { id: projectId, ownerId: userId },
        {
          id: projectId,
          collaborators: {
            some: {
              email: {
                equals: email ?? undefined,
              },
            },
          },
        },
      ],
    },
  });

  return !!project;
}

export async function getProjectWithAccess(projectId: string) {
  const { userId, email } = await getProjectAccess();

  if (!userId) return null;

  return await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              email: {
                equals: email ?? undefined,
              },
            },
          },
        },
      ],
    },
  });
}
