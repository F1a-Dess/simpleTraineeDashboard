import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Try querying the trainee model directly. If it fails because the model doesn't exist
    // run the user fallback or return sample data. This is more robust than feature-detecting
    // the presence of properties on the Prisma client which can vary by runtime.
    try {
      // Pagination params
      const q = getQuery(event)
      const page = Math.max(1, parseInt(String(q.page ?? '1')) || 1)
      const perPage = Math.min(100, Math.max(1, parseInt(String(q.perPage ?? '10')) || 10))
      const skip = (page - 1) * perPage

      // Sorting and filtering
      const sort = String(q.sort ?? 'id_desc') // e.g. name_asc or id_desc
      const filterName = q.filterName ? String(q.filterName) : undefined
      const filterCountry = q.filterCountry ? String(q.filterCountry) : undefined

      const [sortField, sortDir] = sort.split('_')
      const allowedSortFields = new Set(['id', 'name', 'age', 'createdAt'])
      const allowedDir = sortDir === 'asc' ? 'asc' : 'desc'
      const orderBy: any = allowedSortFields.has(sortField) ? { [sortField]: allowedDir } : { id: 'desc' }

      const where: any = {}
      if (filterName) {
        where.OR = [
          { name: { contains: filterName, mode: 'insensitive' } },
          { subtitle: { contains: filterName, mode: 'insensitive' } }
        ]
      }
      if (filterCountry) {
        where.country = { contains: filterCountry, mode: 'insensitive' }
      }

      // total count for meta
      const total = await (prisma as any).trainee.count({ where })

      const rows = await (prisma as any).trainee.findMany({ skip, take: perPage, where, orderBy })
      const data = rows.map((t: any) => ({
        id: t.id,
        name: (t.name ?? `${(t.firstName ?? '') + ' ' + (t.lastName ?? '')}`.trim()) || `Trainee ${t.id}`,
        subtitle: t.subtitle ?? t.title ?? null,
        avatar: t.avatar ?? null,
        experience: t.experience ?? null,
        major: t.major ?? null,
        age: t.age ?? null,
        school: t.school ?? null,
        country: t.country ?? null,
        cv: Boolean(t.cv),
        interview: Boolean(t.interview),
        video: Boolean(t.video),
      }))

      const totalPages = Math.max(1, Math.ceil(total / perPage))
      return {
        data,
        meta: { total, page, perPage, totalPages }
      }
    } catch (e: any) {
      // If the trainee model doesn't exist, Prisma will throw. Fall back to `user` or sample.
      const msg = String(e?.message ?? '')
      const modelMissing = /model.*Trainee.*does not exist/i.test(msg) || /Unknown.*model/i.test(msg)
      if (!modelMissing) throw e
      // otherwise continue to user fallback below
    }

    // If trainee model wasn't available, try user fallback
    try {
      const rows = await (prisma as any).user.findMany({ take: 200 })
      return rows.map((u: any, idx: number) => ({
        id: u.id ?? idx + 1,
        name: u.name ?? u.email ?? `User ${idx + 1}`,
        subtitle: '',
        avatar: `https://i.pravatar.cc/80?u=${u.id}`,
        experience: '',
        major: '',
        age: '',
        school: '',
        country: '',
        cv: true,
        interview: false,
        video: false,
      }))
    } catch (e) {
      // user model fallback failed too — fall through to sample data
    }

    // Fallback sample data when no compatible model exists
    return [
      {
        id: 2,
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
        id: 1,
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
      },
      {
        id: 3,
        name: 'ANDRI HERMAN ARIYANTO',
        subtitle: '',
        avatar: 'https://i.pravatar.cc/80?img=5',
        experience: '8 years',
        major: '[E-7-1] Welder',
        age: '33',
        school: '',
        country: 'Indonesia',
        cv: true,
        interview: false,
        video: true,
      },
    ]
  } catch (e) {
    // On error return fallback sample data and a small error message
    return {
      error: true,
      message: String(e instanceof Error ? e.message : e),
      data: [
        {
          id: 2,
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
          id: 1,
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
        },
        {
          id: 3,
          name: 'ANDRI HERMAN ARIYANTO',
          subtitle: '',
          avatar: 'https://i.pravatar.cc/80?img=5',
          experience: '8 years',
          major: '[E-7-1] Welder',
          age: '33',
          school: '',
          country: 'Indonesia',
          cv: true,
          interview: false,
          video: true,
        },
      ]
    }
  }
})
