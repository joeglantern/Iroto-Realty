'use server'

import { columns } from './db'
import { asAdmin } from './session'

const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`

export async function getContactMessages(filters: { status: string; search: string }) {
  return asAdmin(tx => tx<any[]>`
    select * from contact_inquiries
    where true
      ${filters.status !== 'all' ? tx`and status = ${filters.status}` : tx``}
      ${filters.search
        ? tx`and (name ilike ${likePattern(filters.search)} or email ilike ${likePattern(filters.search)}
            or subject ilike ${likePattern(filters.search)})`
        : tx``}
    order by created_at desc`)
}

export async function updateContactMessage(id: string, updates: Record<string, unknown>) {
  await asAdmin(tx => tx<any[]>`
    update contact_inquiries set ${tx(columns({ ...updates, updated_at: new Date().toISOString() }))}
    where id = ${id}`)
}

export async function deleteContactMessage(id: string) {
  await asAdmin(tx => tx<any[]>`delete from contact_inquiries where id = ${id}`)
}
