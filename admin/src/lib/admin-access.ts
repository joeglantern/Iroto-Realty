'use server'

import { getAdminUser } from './session'

export async function hasAdminAccess() {
  return (await getAdminUser()) !== null
}
