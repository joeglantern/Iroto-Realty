import { NextRequest, NextResponse } from 'next/server';
import { createTravelSection } from '@/lib/travel-cms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.page_type || !body.section_key || !body.title) {
      return NextResponse.json(
        { error: 'Page type, section key, and title are required' },
        { status: 400 }
      );
    }

    // Create the travel section
    const newSection = await createTravelSection({
      page_type: body.page_type,
      section_key: body.section_key,
      title: body.title,
      subtitle: body.subtitle || null,
      background_color: body.background_color || 'white',
      is_active: body.is_active ?? true,
      sort_order: body.sort_order || 0,
    });

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error('Error creating travel section:', error);
    return NextResponse.json(
      { error: 'Failed to create travel section' },
      { status: 500 }
    );
  }
}