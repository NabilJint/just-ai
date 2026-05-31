import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const CURRENT_USER_TIMEOUT_MS = 5_000;

async function tryGetEmail(): Promise<string | null> {
  try {
    const user = await Promise.race([
      currentUser(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("currentUser timed out")),
          CURRENT_USER_TIMEOUT_MS,
        ),
      ),
    ]);
    return user?.emailAddresses[0]?.emailAddress?.toLowerCase() || null;
  } catch (e) {
    console.warn("currentUser fetch failed (non-fatal)", e);
    return null;
  }
}

export async function getProjectAccess() {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, email: null };
  }

  const email = await tryGetEmail();

  return { userId, email };
}

export async function checkProjectAccess(projectId: string) {
  const { userId, email } = await getProjectAccess();

  if (!userId) return false;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) return false;

  return (
    project.ownerId === userId ||
    project.collaborators.some(
      (collaborator) =>
        collaborator.userId === userId ||
        (email !== null && collaborator.email.toLowerCase() === email),
    )
  );
}

export async function getProjectWithAccess(projectId: string) {
  const { userId, email } = await getProjectAccess();

  if (!userId) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) return null;

  const hasAccess =
    project.ownerId === userId ||
    project.collaborators.some(
      (collaborator) =>
        collaborator.userId === userId ||
        (email !== null && collaborator.email.toLowerCase() === email),
    );

  return hasAccess ? project : null;
}
