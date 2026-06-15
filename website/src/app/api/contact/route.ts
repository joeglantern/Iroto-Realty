import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const userIP = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const getInquiryType = (subject: string) => {
      if (!subject) return 'general';
      const subjectLower = subject.toLowerCase();
      if (subjectLower.includes('rental')) return 'property';
      if (subjectLower.includes('purchase')) return 'property';
      if (subjectLower.includes('investment')) return 'investment';
      return 'general';
    };

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
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification to admin
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Iroto Realty <noreply@irotorealty.com>',
        to: ['info@irotorealty.com'],
        subject: `New Contact Inquiry: ${subject || 'General Inquiry'} from ${name}`,
        html: `
          <h2>New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });

      // Send auto-reply to customer
      await resend.emails.send({
        from: 'Iroto Realty <noreply@irotorealty.com>',
        to: [email],
        subject: 'Thank you for contacting Iroto Realty',
        html: `
          <h2>Thank you, ${name}!</h2>
          <p>We have received your inquiry and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to browse our <a href="https://irotorealty.com/rental-portfolio">rental portfolio</a> or <a href="https://irotorealty.com/sales-collection">sales collection</a>.</p>
          <br>
          <p>Best regards,<br>The Iroto Realty Team</p>
        `,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your inquiry! We will get back to you within 24 hours.',
        id: data.id
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
