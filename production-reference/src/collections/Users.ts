import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === 'administrator',
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'administrator',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      options: ['author', 'editor', 'administrator'],
    },
  ],
}
