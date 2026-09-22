import { betterAuth } from 'better-auth'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    // Admin accounts are created with scripts/create-admin.mjs, never from the login page.
    disableSignUp: true,
    password: {
      hash: hashPassword,
      // Accounts migrated from Supabase and created by the CLI script use bcrypt hashes.
      verify: ({ hash, password }) =>
        hash.startsWith('$2') ? bcrypt.compare(password, hash) : verifyPassword({ hash, password }),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    database: { generateId: 'uuid' },
  },
})
