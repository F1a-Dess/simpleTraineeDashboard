(async ()=>{
  try{
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const rows = await prisma.trainee.findMany({ take: 1 })
    console.log('OK', rows.length)
    await prisma.$disconnect()
  } catch(e) {
    console.error('ERR', e && e.message ? e.message : e)
    process.exitCode = 1
  }
})()
