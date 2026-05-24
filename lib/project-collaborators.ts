import { clerkClient, type User } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface Collaborator {
  id: string;
  email: string;
  createdAt?: Date;
  displayName: string | null;
  avatar: string | null;
  role: "owner" | "collaborator";
}

export class ProjectCollaboratorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectCollaboratorValidationError";
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Fetch and enrich all project collaborators, including the owner.
 */
export async function getProjectCollaborators(
  projectId: string,
): Promise<Collaborator[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const clerk = await clerkClient();

  // Enrich owner
  let ownerInfo: Collaborator = {
    id: project.ownerId,
    email: "", // Default email for owner if not found
    displayName: "Project Owner",
    avatar: null,
    role: "owner",
  };

  try {
    const ownerUser: User = await clerk.users.getUser(project.ownerId);
    ownerInfo = {
      id: project.ownerId,
      email:
        ownerUser.primaryEmailAddress?.emailAddress ??
        ownerUser.emailAddresses[0]?.emailAddress ??
        "",
      displayName:
        ownerUser.fullName ?? ownerUser.firstName ?? "Project Owner",
      avatar: ownerUser.imageUrl ?? null,
      role: "owner",
    };
  } catch (e) {
    // Fallback to defaults if owner not found in Clerk
  }

  // Enrich collaborators
  const enrichedCollaborators = await Promise.all(
    collaborators.map(async (c) => {
      try {
        const usersResponse = await clerk.users.getUserList({
          emailAddress: [c.email],
        }) as unknown as { data: User[]; totalCount: number };

        const user = usersResponse.data?.[0] ?? null;

        return {
          id: c.id,
          email: c.email,
          createdAt: c.createdAt,
          displayName: user ? user.fullName || user.firstName || null : null,
          avatar: user?.imageUrl ?? null,
          role: "collaborator" as const,
        };
      } catch (e) {
        return {
          id: c.id,
          email: c.email,
          createdAt: c.createdAt,
          displayName: null,
          avatar: null,
          role: "collaborator" as const,
        };
      }
    }),
  );

  return [ownerInfo, ...enrichedCollaborators];
}

/**
 * Add a collaborator to the project.
 * Only owners should call this from the API.
 */
export async function addProjectCollaborator(projectId: string, email: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const normalizedEmail = normalizeEmail(email);
  const clerk = await clerkClient();
  const ownerUser: User = await clerk.users.getUser(project.ownerId);
  const ownerEmails = ownerUser.emailAddresses.map((ownerEmail) =>
    normalizeEmail(ownerEmail.emailAddress),
  );

  if (ownerEmails.includes(normalizedEmail)) {
    throw new ProjectCollaboratorValidationError(
      "Project owner cannot be added as a collaborator",
    );
  }

  const collab = await prisma.projectCollaborator.create({
    data: { projectId, email: normalizedEmail },
  });

  try {
    const users = await clerk.users.getUserList({
      emailAddress: [normalizedEmail],
    });
    const user = (users as any)?.[0];
    return {
      id: collab.id,
      email: collab.email,
      createdAt: collab.createdAt,
      displayName: user ? user.fullName || user.firstName || null : null,
      avatar: user ? user.imageUrl ?? user.image_url : null,
      role: "collaborator" as const,
    };
  } catch {
    return {
      id: collab.id,
      email: collab.email,
      createdAt: collab.createdAt,
      displayName: null,
      avatar: null,
      role: "collaborator" as const,
    };
  }
}

/**
 * Remove a collaborator from the project.
 * Only owners should call this from the API.
 */
export async function removeProjectCollaborator(
  projectId: string,
  email: string,
) {
  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email },
  });
  return { success: true };
}
