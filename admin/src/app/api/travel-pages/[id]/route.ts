import { NextRequest, NextResponse } from 'next/server';
import { updateTravelPage } from '@/lib/travel-cms';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    // Update the travel page
    const updatedPage = await updateTravelPage(id, body);

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating travel page:', error);
    return NextResponse.json(
      { error: 'Failed to update travel page' },
      { status: 500 }
    );
  }
}