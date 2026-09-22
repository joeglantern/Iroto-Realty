'use server'

import { columns } from './db'
import { asAdmin } from './session'
import type { Review } from './types'

// Reviews CRUD operations
export async function getReviews() {
  return asAdmin(tx => tx<any[]>`
    select r.*,
      (select json_build_object('title', p.title, 'slug', p.slug) from properties p where p.id = r.property_id) as properties
    from reviews r
    order by r.created_at desc`)
}

export async function getReview(id: string) {
  return asAdmin(async tx => {
    const [review] = await tx<any[]>`
      select r.*,
        (select json_build_object('id', p.id, 'title', p.title, 'slug', p.slug) from properties p where p.id = r.property_id) as properties
      from reviews r
      where r.id = ${id}`
    if (!review) throw new Error('Review not found')
    return review
  })
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into reviews ${tx(columns(review))} returning *`
    return created
  })
}

export async function updateReview(id: string, updates: Partial<Review>) {
  return asAdmin(async tx => {
    const [updated] = await tx<any[]>`update reviews set ${tx(columns(updates))} where id = ${id} returning *`
    if (!updated) throw new Error('Review not found')
    return updated
  })
}

export async function deleteReview(id: string) {
  await asAdmin(tx => tx<any[]>`delete from reviews where id = ${id}`)
}

// Get properties for review form dropdown
export async function getPropertiesForReview() {
  return asAdmin(tx => tx<any[]>`
    select id, title, slug from properties
    where status = 'published' and is_active = true
    order by title`)
}
