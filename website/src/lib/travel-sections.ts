import { supabase } from './supabase';

export interface TravelSection {
  id: string;
  page_type: 'pre_arrival' | 'getting_there';
  title: string;
  content: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get travel sections for a specific page
export async function getTravelSections(pageType: 'pre_arrival' | 'getting_there'): Promise<TravelSection[]> {
  try {
    const { data, error } = await supabase
      .from('travel_sections')
      .select('*')
      .eq('page_type', pageType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching travel sections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTravelSections:', error);
    return [];
  }
}