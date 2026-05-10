import { prisma } from '@/app/lib/prisma'

export async function isAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { email },
    select: { role: true },
  })
  return user?.role === 'admin'
}

export async function isTutor(email: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { email },
    select: { role: true },
  })
  return user?.role === 'tutor' || user?.role === 'admin'
}

export async function getUserRole(email: string): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { email },
    select: { role: true },
  })
  return user?.role || 'user'
}
