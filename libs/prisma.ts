// prisma.ts (create this file to manage Prisma client)
import { PrismaClient } from '@prisma/client'

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

export default prisma
