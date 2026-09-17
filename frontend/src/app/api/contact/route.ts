import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Contact Form API Route with Direct Gmail SMTP Integration
 *
 * 100% Free of Cost via Gmail's native SMTP relay (smtp.gmail.com).
 *
 * Configurable via frontend/.env.local:
 * - CONTACT_RECIPIENT_EMAIL: The inbox where messages will land (testing or production)
 * - GMAIL_USER: Your Gmail address used to dispatch the email
 * - GMAIL_APP_PASSWORD: A 16-character Google App Password (generated in Google Account Security)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name = '', email = '', type = 'technical', message = '' } = body;

    // 1. Validate required fields
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanMessage = String(message).trim();
    const cleanType = String(type).trim();

    if (!cleanName) {
      return NextResponse.json({ message: 'Full name is required.' }, { status: 400 });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ message: 'A valid email address is required.' }, { status: 400 });
    }
    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json({ message: 'Message must be at least 5 characters.' }, { status: 400 });
    }

    // 2. Read configured recipient and Gmail credentials
    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'support@elarion.com';
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''); // strip spaces if any

    // Format category labels
    const categoryLabels: Record<string, string> = {
      technical: 'Technical Support',
      billing: 'Billing & Subscriptions',
      academic: 'Academic & Grading',
      partnership: 'Institutional Partnership',
      general: 'General Inquiry',
    };
    const categoryName = categoryLabels[cleanType] || cleanType;
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const emailSubject = `[PPAcademia Contact] ${categoryName} from ${cleanName}`;

    // 3. Prepare professional HTML email template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #001F3F; padding: 28px 32px; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
            .content { padding: 32px; color: #1e293b; }
            .field-group { margin-bottom: 20px; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #64748b; margin-bottom: 6px; }
            .value { font-size: 15px; font-weight: 600; color: #0f172a; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #eff6ff; color: #027FFF; font-size: 12px; font-weight: 700; }
            .message-box { background: #f1f5f9; border-left: 4px solid #027FFF; border-radius: 8px; padding: 18px; margin-top: 10px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
            .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Contact Form Message</h1>
              <p>PPAcademia AI Learning Platform</p>
            </div>
            <div class="content">
              <div class="field-group">
                <div class="label">Inquiry Category</div>
                <span class="badge">${categoryName}</span>
              </div>
              <div class="field-group">
                <div class="label">Sender Name</div>
                <div class="value">${cleanName}</div>
              </div>
              <div class="field-group">
                <div class="label">Sender Email</div>
                <div class="value"><a href="mailto:${cleanEmail}" style="color: #027FFF; text-decoration: none;">${cleanEmail}</a></div>
              </div>
              <div class="field-group">
                <div class="label">Received At</div>
                <div class="value" style="font-size: 13px; color: #64748b;">${timestamp}</div>
              </div>
              <div class="field-group" style="margin-top: 24px;">
                <div class="label">Message Content</div>
                <div class="message-box">${cleanMessage}</div>
              </div>
            </div>
            <div class="footer">
              Dispatched via PPAcademia Gmail Integration.<br/>
              Click &ldquo;Reply&rdquo; in your email client to reply directly to <strong>${cleanEmail}</strong>.
            </div>
          </div>
        </body>
      </html>
    `;

    const plainText = `
New Contact Inquiry - PPAcademia
---------------------------------
Category: ${categoryName}
From:     ${cleanName} (${cleanEmail})
Date:     ${timestamp}

Message:
${cleanMessage}

(Reply to this email to contact ${cleanEmail} directly.)
    `.trim();

    // 4. If Gmail SMTP credentials are configured, dispatch real email
    if (gmailUser && gmailAppPassword) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      await transporter.sendMail({
        from: `"PPAcademia Support" <${gmailUser}>`,
        to: recipientEmail,
        replyTo: cleanEmail,
        subject: emailSubject,
        text: plainText,
        html: htmlBody,
      });

      console.log(`[Contact Form] Email successfully delivered via Gmail SMTP to ${recipientEmail}`);

      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully! Our team will get back to you shortly.',
        recipient: recipientEmail,
      });
    }

    // 5. DEV SIMULATION MODE: When Gmail credentials are not yet added
    console.log('\n======================================================');
    console.log('📨 [DEV STUDIO CONTACT EMAIL SIMULATION]');
    console.log(`Destination Inbox (CONTACT_RECIPIENT_EMAIL): ${recipientEmail}`);
    console.log(`Sender:       ${cleanName} <${cleanEmail}>`);
    console.log(`Category:     ${categoryName}`);
    console.log(`Subject:      ${emailSubject}`);
    console.log('Message:');
    console.log(cleanMessage);
    console.log('------------------------------------------------------');
    console.log('💡 TO RECEIVE THIS DIRECTLY IN YOUR GMAIL INBOX:');
    console.log('1. In frontend/.env.local, set:');
    console.log('   GMAIL_USER="your_gmail@gmail.com"');
    console.log('   GMAIL_APP_PASSWORD="16_character_app_password"');
    console.log('   CONTACT_RECIPIENT_EMAIL="destination_email@gmail.com"');
    console.log('======================================================\n');

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! Our team will get back to you shortly.',
      dev_mode: true,
      recipient: recipientEmail,
    });
  } catch (err: unknown) {
    console.error('[Contact Form] Gmail dispatch error:', err);
    return NextResponse.json(
      { message: (err as Error).message || 'Failed to dispatch email via Gmail.' },
      { status: 500 }
    );
  }
}
