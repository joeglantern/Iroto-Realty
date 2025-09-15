import { supabase } from './supabase'
import type { BlogPost, BlogCategory } from './supabase'

// Blog Posts CRUD operations
export async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name, slug)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getBlogPost(id: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(id, name, slug)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Blog Categories CRUD operations
export async function getBlogCategories() {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createBlogCategory(category: Omit<BlogCategory, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('blog_categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBlogCategory(id: string, updates: Partial<BlogCategory>) {
  const { data, error } = await supabase
    .from('blog_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBlogCategory(id: string) {
  const { error } = await supabase
    .from('blog_categories')
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