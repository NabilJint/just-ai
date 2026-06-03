import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  if (databaseUrl.startsWith('prisma+postgres://')) {
    // Use Prisma Accelerate
    return new PrismaClient({ accelerateUrl: databaseUrl })
  } else {
    // Use direct PostgreSQL adapter
    const pool = new pg.Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined,
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
