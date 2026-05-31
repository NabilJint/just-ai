-- AlterTable: Add userId column to ProjectCollaborator
ALTER TABLE "ProjectCollaborator" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "ProjectCollaborator_userId_idx" ON "ProjectCollaborator"("userId");
