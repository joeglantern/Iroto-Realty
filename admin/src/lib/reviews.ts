import { supabase } from './supabase'
import type { Review } from './supabase'

// Reviews CRUD operations
export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      properties(title, slug)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getReview(id: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      properties(id, title, slug)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  
  try {
    
    // Test basic connection first
    const { data: testData, error: testError } = await supabase
      .from('reviews')
      .select('count')
      .limit(1);
    
    
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    
    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteReview(id: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get properties for review form dropdown
export async function getPropertiesForReview() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, slug')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('title')

  if (error) throw error
  return data
}
