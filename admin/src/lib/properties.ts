'use server'

import { columns, type Tx } from './db'
import { asAdmin } from './session'
import type { Property, PropertyCategory, PropertyType, PropertyImage } from './types'

const propertyWithRelations = (tx: Tx) => tx<any[]>`
  select p.*,
    (select json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) from property_categories c where c.id = p.category_id) as property_categories,
    coalesce((select json_agg(json_build_object('id', i.id, 'image_path', i.image_path, 'alt_text', i.alt_text, 'sort_order', i.sort_order) order by i.sort_order)
      from property_images i where i.property_id = p.id), '[]'::json) as property_images
  from properties p`

// Properties CRUD operations
export async function getProperties() {
  return asAdmin(tx => tx<any[]>`${propertyWithRelations(tx)} order by p.created_at desc`)
}

export async function getProperty(id: string) {
  return asAdmin(async tx => {
    const [property] = await tx<any[]>`${propertyWithRelations(tx)} where p.id = ${id}`
    if (!property) throw new Error('Property not found')
    return property
  })
}

export async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'slug'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into properties ${tx(columns(property))} returning *`
    return created
  })
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  return asAdmin(async tx => {
    const [updated] = await tx<any[]>`
      update properties set ${tx(columns({ ...updates, updated_at: new Date().toISOString() }))}
      where id = ${id}
      returning *`
    if (!updated) throw new Error('Property not found')
    return updated
  })
}

export async function deleteProperty(id: string) {
  await asAdmin(tx => tx<any[]>`delete from properties where id = ${id}`)
}

// Property Categories CRUD operations
export async function getPropertyCategories() {
  return asAdmin(tx => tx<any[]>`select * from property_categories order by sort_order`)
}

export async function createPropertyCategory(category: Omit<PropertyCategory, 'id' | 'created_at' | 'updated_at'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into property_categories ${tx(columns(category))} returning *`
    return created
  })
}

export async function updatePropertyCategory(id: string, updates: Partial<PropertyCategory>) {
  return asAdmin(async tx => {
    const [updated] = await tx<any[]>`
      update property_categories set ${tx(columns(updates))} where id = ${id} returning *`
    if (!updated) throw new Error('Category not found')
    return updated
  })
}

export async function deletePropertyCategory(id: string) {
  await asAdmin(tx => tx<any[]>`delete from property_categories where id = ${id}`)
}

// Property Types CRUD operations
export async function getPropertyTypes() {
  return asAdmin(tx => tx<any[]>`select * from property_types where is_active = true order by name`)
}

export async function createPropertyType(type: Omit<PropertyType, 'id' | 'created_at'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into property_types ${tx(columns(type))} returning *`
    return created
  })
}

// Property Images CRUD operations
export async function addPropertyImage(image: Omit<PropertyImage, 'id' | 'created_at'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into property_images ${tx(columns(image))} returning *`
    return created
  })
}

export async function addPropertyImages(images: Omit<PropertyImage, 'id' | 'created_at'>[]) {
  if (images.length === 0) return []
  return asAdmin(tx => tx<any[]>`insert into property_images ${tx(images.map(columns))} returning *`)
}

export async function deletePropertyImage(id: string) {
  await asAdmin(tx => tx<any[]>`delete from property_images where id = ${id}`)
}
