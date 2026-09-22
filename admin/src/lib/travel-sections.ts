'use server'

import { columns } from './db'
import { asAdmin } from './session'
import type { TravelSection } from './types'

export async function getTravelSections(pageType: TravelSection['page_type']) {
  return asAdmin(tx => tx<TravelSection[]>`
    select * from travel_sections where page_type = ${pageType} order by sort_order asc`)
}

export async function createTravelSection(section: Omit<TravelSection, 'id' | 'created_at' | 'updated_at'>) {
  await asAdmin(tx => tx`insert into travel_sections ${tx(columns(section))}`)
}

export async function updateTravelSection(id: string, updates: Partial<TravelSection>) {
  await asAdmin(tx => tx`update travel_sections set ${tx(columns(updates))} where id = ${id}`)
}

export async function reorderTravelSections(updates: { id: string; sort_order: number }[]) {
  await asAdmin(async tx => {
    for (const update of updates) {
      await tx`update travel_sections set sort_order = ${update.sort_order} where id = ${update.id}`
    }
  })
}

export async function deleteTravelSection(id: string) {
  await asAdmin(tx => tx`delete from travel_sections where id = ${id}`)
}
