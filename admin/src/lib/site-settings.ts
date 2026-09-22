'use server'

import { asAdmin } from './session'

export interface SiteSetting {
  setting_key: string
  setting_value: string
  setting_type: 'text' | 'json'
  is_public: boolean
  category: string
}

export async function getSiteImageSettings() {
  return asAdmin(tx => tx<{ setting_key: string; setting_value: string | null }[]>`
    select setting_key, setting_value from system_settings where category = 'site_images'`)
}

export async function upsertSiteSettings(settings: SiteSetting[]) {
  await asAdmin(tx => tx`
    insert into system_settings ${tx(settings, 'setting_key', 'setting_value', 'setting_type', 'is_public', 'category')}
    on conflict (setting_key) do update set
      setting_value = excluded.setting_value,
      setting_type = excluded.setting_type,
      is_public = excluded.is_public,
      category = excluded.category`)
}
