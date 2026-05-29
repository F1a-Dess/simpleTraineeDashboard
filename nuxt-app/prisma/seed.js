import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding trainees (10 rows)...')

  const sample = [
    {
      name: 'ANDI YUDA',
      subtitle: 'bachelors · Universitas Putera Batam',
      avatar: 'https://i.pravatar.cc/80?img=12',
      experience: '5 years',
      major: '[E-7-1] Mechanical Engineering',
      age: '27',
      school: 'Universitas Putera Batam',
      country: 'Indonesia',
      cv: true,
      interview: false,
      video: true,
    },
    {
      name: 'ANDRI',
      subtitle: '',
      avatar: 'https://i.pravatar.cc/80?img=5',
      experience: '5 years',
      major: '[E-7-1] Mechanical Engineering',
      age: '33',
      school: '',
      country: 'Indonesia',
      cv: true,
      interview: false,
      video: true,
    }
  ]

  // Remove existing trainees to ensure a clean seed (keeps table small)
  await prisma.trainee.deleteMany({})

  // Insert up to 10 rows, repeating sample data if needed
  const rows = []
  for (let i = 0; i < 10; i++) {
    const data = sample[i % sample.length]
    rows.push(prisma.trainee.create({ data }))
  }

  await Promise.all(rows)

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
