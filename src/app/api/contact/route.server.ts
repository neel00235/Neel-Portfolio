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

    const isDummyPassword = !smtpAppPassword || smtpAppPassword.includes('xxxx') || smtpAppPassword.length < 16;

    if (!smtpUser || isDummyPassword || !contactTo) {
      return NextResponse.json(
        { error: 'SMTP not configured', unconfigured: true },
        { status: 503 }
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

    const subject = `🎬 New Project Inquiry: ${name || 'Client'} — neelpatel.com`;
    const textContent = `🎬 NEW CLIENT BRIEF\n\nClient Name: ${name}\nEmail: ${email}\n\nProject Brief & Scope:\n${message}\n\nSent from neelpatel.com`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 24px; background-color: #0c0a08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #faf4e8;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #13100c; border: 1px solid #2e261d; border-radius: 14px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #f67c29, #d6a76c); height: 4px; width: 100%;"></div>
          <div style="padding: 28px 28px 20px 28px; border-bottom: 1px solid #241d16;">
            <div style="font-family: ui-monospace, Consolas, monospace; font-size: 11px; letter-spacing: 0.18em; color: #f67c29; text-transform: uppercase; margin-bottom: 6px;">
              🎬 INCOMING CLIENT BRIEF · NEEL PATEL EDITORIAL
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #faf4e8; letter-spacing: -0.02em;">
              New Project Inquiry
            </h1>
          </div>
          <div style="padding: 20px 28px; background-color: #1b1611; border-bottom: 1px solid #241d16;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; width: 120px; font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #948a7b; text-transform: uppercase;">Client:</td>
                <td style="padding: 5px 0; font-size: 15px; font-weight: 600; color: #faf4e8;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #948a7b; text-transform: uppercase;">Email:</td>
                <td style="padding: 5px 0; font-size: 15px; color: #f67c29;">
                  <a href="mailto:${escapeHtml(email)}" style="color: #f67c29; text-decoration: none; font-weight: 500;">${escapeHtml(email)}</a>
                </td>
              </tr>
            </table>
          </div>
          <div style="padding: 24px 28px;">
            <div style="font-family: ui-monospace, Consolas, monospace; font-size: 11px; letter-spacing: 0.15em; color: #948a7b; text-transform: uppercase; margin-bottom: 10px;">
              PROJECT BRIEF &amp; TIMELINE
            </div>
            <div style="background-color: #18130e; border: 1px solid #2e261d; border-left: 3px solid #f67c29; border-radius: 6px; padding: 18px; font-size: 14px; line-height: 1.6; color: #e2d7c0; white-space: pre-wrap;">${escapeHtml(message)}</div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${escapeHtml(email)}?subject=Re:%20Project%20Enquiry%20%E2%80%94%20Neel%20Patel" 
                 style="display: inline-block; background-color: #f67c29; color: #13100c; font-family: ui-monospace, Consolas, monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border-radius: 9999px;">
                ✉️ Reply to ${escapeHtml(name)}
              </a>
            </div>
          </div>
          <div style="padding: 16px 28px; background-color: #0e0c0a; border-top: 1px solid #241d16; text-align: center;">
            <p style="margin: 0; font-family: ui-monospace, Consolas, monospace; font-size: 11px; color: #948a7b;">
              Sent via <a href="https://neelpatel.com" style="color: #d6a76c; text-decoration: none;">neelpatel.com</a> · Video Editing &amp; Colour Grading Suite
            </p>
          </div>
        </div>
      </body>
      </html>
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
      { error: 'Failed to send message via SMTP.', unconfigured: true },
      { status: 503 }
    );
  }
}
