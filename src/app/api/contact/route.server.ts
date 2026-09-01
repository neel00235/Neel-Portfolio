import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting state: in-memory sliding window keyed by IP
// 5 requests per 10 minutes per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max 5 requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction & rate limit check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.headers.get('x-real-ip') || 'unknown-ip';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before submitting again.' },
        { status: 429 }
      );
    }

    // 2. Read request fields (Name, Email, Message, _gotcha)
    let name = '';
    let email = '';
    let message = '';
    let gotcha = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await req.json().catch(() => ({}));
      name = typeof data.Name === 'string' ? data.Name : '';
      email = typeof data.Email === 'string' ? data.Email : '';
      message = typeof data.Message === 'string' ? data.Message : '';
      gotcha = typeof data._gotcha === 'string' ? data._gotcha : '';
    } else {
      const formData = await req.formData().catch(() => new FormData());
      name = (formData.get('Name') as string) || '';
      email = (formData.get('Email') as string) || '';
      message = (formData.get('Message') as string) || '';
      gotcha = (formData.get('_gotcha') as string) || '';
    }

    name = name.trim();
    email = email.trim();
    message = message.trim();

    // 3. Honeypot check: return 200 OK and send nothing (never alert bots)
    if (gotcha) {
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    // 4. Validate fields
    if (!name) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (name.length > 200) {
      return NextResponse.json({ error: 'Name must be 200 characters or fewer.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Please enter your email address.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Please enter your message.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or fewer.' }, { status: 400 });
    }

    // 5. Environment configuration
    const smtpUser = process.env.SMTP_USER;
    const smtpAppPassword = process.env.SMTP_APP_PASSWORD;
    const contactTo = process.env.CONTACT_TO || smtpUser;

    if (!smtpUser || !smtpAppPassword || !contactTo) {
      console.error('SMTP configuration missing: SMTP_USER, SMTP_APP_PASSWORD, or CONTACT_TO is not set');
      return NextResponse.json(
        { error: 'Email service is temporarily unconfigured. Please email me directly.' },
        { status: 500 }
      );
    }

    // 6. Send via Gmail SMTP (port 465, secure: true)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpAppPassword,
      },
    });

    const subject = `New enquiry from ${name || 'portfolio visitor'} — neelpatel.com`;
    const textContent = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
        <h2 style="color: #f67c29; margin-bottom: 16px;">New Enquiry from neelpatel.com</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Message:</strong></p>
        <div style="background: #f9f9f9; border-left: 4px solid #f67c29; padding: 12px 16px; margin: 12px 0; white-space: pre-wrap;">${escapeHtml(message)}</div>
      </div>
    `;

    await transporter.sendMail({
      from: smtpUser,
      to: contactTo,
      replyTo: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (err: unknown) {
    console.error('Error sending email via SMTP:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to send message via SMTP. Please try again or email directly.' },
      { status: 500 }
    );
  }
}
