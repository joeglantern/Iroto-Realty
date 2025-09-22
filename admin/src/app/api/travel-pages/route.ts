import { NextRequest, NextResponse } from 'next/server';
import { createTravelPage } from '@/lib/travel-cms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.page_type) {
      return NextResponse.json(
        { error: 'Page type is required' },
        { status: 400 }
      );
    }

    // Create the travel page
    const newPage = await createTravelPage({
      page_type: body.page_type,
      title: body.title || null,
      subtitle: body.subtitle || null,
      hero_image_path: body.hero_image_path || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      is_active: body.is_active ?? true,
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Error creating travel page:', error);
    return NextResponse.json(
      { error: 'Failed to create travel page' },
      { status: 500 }
    );
  }
}