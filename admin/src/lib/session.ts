import { headers } from 'next/headers'
import { auth } from './auth'
import { sql, type Tx } from './db'

export async function getAdminUser() {
  const session = await auth.api.getSession({ headers: headers() })
  if (!session) return null

  const [profile] = await sql<{ role: string; is_active: boolean }[]>`
    select role, is_active from profiles where id = ${session.user.id}`
  if (!profile || !profile.is_active || profile.role !== 'admin') return null

  return session.user
}

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) throw new Error('Not authorized. Please sign in again.')
  return user
}

// Run queries as the signed-in admin. The request.jwt.claim.sub setting feeds auth.uid(),
// which the database triggers use to fill created_by / updated_by / approved_by.
export async function asAdmin<T>(run: (tx: Tx) => Promise<T>): Promise<T> {
  const user = await requireAdmin()
  const result = await sql.begin(async tx => {
    await tx`select set_config('request.jwt.claim.sub', ${user.id}, true)`
    return run(tx)
  })
  return result as T
}
