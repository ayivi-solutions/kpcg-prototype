import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'administrator',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'body', type: 'richText', required: true },
    { name: 'featuredMedia', type: 'relationship', relationTo: 'media' },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      options: ['page', 'article', 'resource', 'event', 'opportunity', 'policy', 'programme'],
    },
    { name: 'countySlugs', type: 'text', hasMany: true },
    { name: 'themeSlugs', type: 'text', hasMany: true },
  ],
}
