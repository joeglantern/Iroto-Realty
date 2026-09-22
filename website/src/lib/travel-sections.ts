import { sql } from './db';

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
    return await sql<TravelSection[]>`
      select * from travel_sections
      where page_type = ${pageType} and is_active = true
      order by sort_order asc`;
  } catch (error) {
    console.error('Error in getTravelSections:', error);
    return [];
  }
}
