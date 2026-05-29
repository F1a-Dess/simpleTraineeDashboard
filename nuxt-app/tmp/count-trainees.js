import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const c = await prisma.trainee.count()
  console.log('trainee count:', c)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
