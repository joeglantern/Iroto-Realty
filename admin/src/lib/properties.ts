import { supabase } from './supabase'
import type { Property, PropertyCategory, PropertyType, PropertyImage } from './supabase'

// Properties CRUD operations
export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_categories(id, name, slug),
      property_images(id, image_path, alt_text, sort_order)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_categories(id, name, slug),
      property_images(id, image_path, alt_text, sort_order)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'slug'>) {
  console.log('createProperty called with:', property);
  
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single()

  console.log('createProperty response - data:', data, 'error:', error);
  
  if (error) {
    console.error('Property creation failed:', error);
    throw error;
  }
  return data
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  const { data, error } = await supabase
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Property Categories CRUD operations
export async function getPropertyCategories() {
  const { data, error } = await supabase
    .from('property_categories')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data
}

export async function createPropertyCategory(category: Omit<PropertyCategory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('property_categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePropertyCategory(id: string, updates: Partial<PropertyCategory>) {
  const { data, error } = await supabase
    .from('property_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePropertyCategory(id: string) {
  const { error } = await supabase
    .from('property_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Property Types CRUD operations
export async function getPropertyTypes() {
  const { data, error } = await supabase
    .from('property_types')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function createPropertyType(type: Omit<PropertyType, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('property_types')
    .insert(type)
    .select()
    .single()

  if (error) throw error
  return data
}

// Property Images CRUD operations
export async function addPropertyImage(image: Omit<PropertyImage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('property_images')
    .insert(image)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePropertyImage(id: string) {
  const { error } = await supabase
    .from('property_images')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper function to generate slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}