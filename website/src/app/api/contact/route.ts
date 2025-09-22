import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Get user IP and User Agent for tracking
    const userIP = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Map subject to inquiry type
    const getInquiryType = (subject: string) => {
      if (!subject) return 'general';
      const subjectLower = subject.toLowerCase();
      if (subjectLower.includes('rental')) return 'property';
      if (subjectLower.includes('purchase')) return 'property';
      if (subjectLower.includes('investment')) return 'investment';
      return 'general';
    };

    // Save to database
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        inquiry_type: getInquiryType(subject),
        status: 'new',
        priority: 'normal',
        source: 'contact_form',
        user_ip: userIP,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      );
    }

    // Log successful submission
    console.log('Contact form submission saved:', {
      id: data.id,
      name: data.name,
      email: data.email,
      inquiry_type: data.inquiry_type,
      timestamp: data.created_at,
    });

    // TODO: Send notification email to admin
    // TODO: Send auto-responder email to customer

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your inquiry! We will get back to you within 24 hours.',
        id: data.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}