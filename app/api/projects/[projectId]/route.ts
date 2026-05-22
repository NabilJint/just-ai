import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/projects/[projectId]
 * Rename a project. Only the owner can rename.
 * Body: { name: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let name: string | undefined

  try {
    const body = await request.json()
    if (body.name && typeof body.name === 'string' && body.name.trim()) {
      name = body.name.trim()
    }
  } catch {
    // Invalid JSON
  }

  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return Response.json(updated)
}

/**
 * DELETE /api/projects/[projectId]
 * Delete a project. Only the owner can delete.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return Response.json({ success: true })
}
