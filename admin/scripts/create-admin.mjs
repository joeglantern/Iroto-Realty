// Create an admin account, or reset an existing account's password (this also signs it out everywhere).
// On the server:  docker compose exec admin node scripts/create-admin.mjs someone@irotorealty.com "Full Name"
import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import bcrypt from 'bcryptjs'
import postgres from 'postgres'

const [rawEmail, name] = process.argv.slice(2)
if (!rawEmail || !rawEmail.includes('@')) {
  console.error('Usage: node scripts/create-admin.mjs <email> ["Full Name"]')
  process.exit(1)
}
const email = rawEmail.trim().toLowerCase()

const rl = createInterface({ input: process.stdin, output: process.stdout })
const password = (await rl.question('New password (min 12 characters): ')).trim()
rl.close()
if (password.length < 12) {
  console.error('Password must be at least 12 characters.')
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)
const hash = await bcrypt.hash(password, 12)

const created = await sql.begin(async tx => {
  const [existing] = await tx`select id from "user" where email = ${email}`
  const id = existing?.id ?? randomUUID()

  if (!existing) {
    await tx`
      insert into "user" (id, name, email, "emailVerified")
      values (${id}, ${name || email.split('@')[0]}, ${email}, true)`
  }

  await tx`delete from account where "userId" = ${id} and "providerId" = 'credential'`
  await tx`
    insert into account ("accountId", "providerId", "userId", password, "updatedAt")
    values (${id}, 'credential', ${id}, ${hash}, now())`
  await tx`delete from session where "userId" = ${id}`

  await tx`
    insert into profiles (id, email, role, is_active)
    values (${id}, ${email}, 'admin', true)
    on conflict (id) do update set role = 'admin', is_active = true`

  return !existing
})

console.log(created ? `Created admin ${email}` : `Password reset and admin access confirmed for ${email}`)
await sql.end()
