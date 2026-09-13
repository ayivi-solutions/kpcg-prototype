import { getPayload } from 'payload'
import config from '../../payload.config'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { slug: { equals: 'home' } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })

  const page = docs[0]

  return (
    <main>
      <p>Kenya Platform for Climate Governance</p>
      <h1>{page?.title ?? 'Climate governance that connects people, evidence and action.'}</h1>
      <p>{page?.summary ?? 'Explore county realities, climate priorities, knowledge and policy engagement through one national public platform.'}</p>
    </main>
  )
}
