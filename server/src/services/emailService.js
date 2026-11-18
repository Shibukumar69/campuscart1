import 'dotenv/config';
import nodemailer from 'nodemailer';

const getTransporter = () => {
  const user = process.env.SMTP_USER || 'shibulucky6969@gmail.com';
  const pass = (process.env.SMTP_PASS || 'hlvs yfog ijex cztq').replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send real Delivery OTP and Order Confirmation email to student
 */
export const sendOrderOtpEmail = async ({ toEmail, studentName, orderNumber, otp, totalAmount, deliveryAddress, items }) => {
  const fromEmail = process.env.EMAIL_FROM || '"CampusCart AI" <shibulucky6969@gmail.com>';
  const transporter = getTransporter();

  if (!toEmail) {
    console.log(`[Email Mock/Skip] Order #${orderNumber} OTP: ${otp} to ${toEmail}`);
    return;
  }

  const itemsHtml = (items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${item.productTitleSnapshot}</td>
        <td style="padding: 8px 0; text-align: center; color: #64748b;">${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; color: #1e293b; font-weight: 600;">₹${item.lineTotal}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 28px 24px; }
        .greeting { font-size: 15px; color: #334155; margin-bottom: 20px; }
        .otp-box { background: #f5f3ff; border: 2px dashed #818cf8; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-title { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 900; color: #4338ca; letter-spacing: 8px; margin: 4px 0; }
        .otp-note { font-size: 12px; color: #64748b; margin-top: 6px; }
        .info-card { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 13px; color: #475569; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CampusCart AI</h1>
          <p>Smart Student Stationery Delivery & Printing</p>
        </div>
        <div class="content">
          <div class="greeting">
            Hello <strong>${studentName}</strong>, your stationery order has been confirmed!
          </div>

          <div class="otp-box">
            <div class="otp-title">Your Delivery Verification OTP</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-note">Share this 6-digit code with the courier at your room to complete handover.</div>
          </div>

          <div class="info-card">
            <div><strong>Order Number:</strong> #${orderNumber}</div>
            <div><strong>Destination:</strong> ${deliveryAddress?.hostelBlock || 'Hostel'}, Room ${deliveryAddress?.roomNumber || 'N/A'}</div>
            <div><strong>Total Payable:</strong> ₹${totalAmount}</div>
          </div>

          <div style="font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 8px;">Purchased Items</div>
          <table class="table">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; font-size: 11px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 6px 0; text-align: left;">Item</th>
                <th style="padding: 6px 0; text-align: center;">Qty</th>
                <th style="padding: 6px 0; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        <div class="footer">
          CampusCart AI Academic Platform • 20-minute hostel room delivery guarantee
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `CampusCart AI — Order #${orderNumber} Confirmed (Delivery OTP: ${otp})`,
      html,
    });
    console.log(`[Email Sent] Delivery OTP email delivered to ${toEmail} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.warn(`[Email Send Error] Could not send email to ${toEmail}:`, error.message);
  }
};

/**
 * Send Password Reset Verification OTP via Gmail
 */
export const sendPasswordResetOtpEmail = async ({ toEmail, userName, otp }) => {
  const fromEmail = process.env.EMAIL_FROM || '"CampusCart AI" <shibulucky6969@gmail.com>';
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 30px 24px; }
        .greeting { font-size: 15px; color: #334155; margin-bottom: 16px; line-height: 1.5; }
        .otp-box { background: #f5f3ff; border: 2px dashed #818cf8; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
        .otp-title { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #4338ca; letter-spacing: 8px; margin: 6px 0; }
        .otp-note { font-size: 12px; color: #64748b; margin-top: 8px; }
        .warning-card { background: #fffbeb; border-radius: 12px; padding: 14px; border: 1px solid #fef3c7; margin-bottom: 20px; font-size: 12px; color: #92400e; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CampusCart AI</h1>
          <p>Password Reset Verification</p>
        </div>
        <div class="content">
          <div class="greeting">
            Hello <strong>${userName || 'Student'}</strong>,<br>
            We received a request to reset the password for your CampusCart AI account associated with <strong>${toEmail}</strong>.
          </div>

          <div class="otp-box">
            <div class="otp-title">Your 6-Digit Password Reset Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-note">Valid for <strong>10 minutes</strong>. Do not share this code with anyone.</div>
          </div>

          <div class="warning-card">
            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or review your account security. Your current password remains unchanged.
          </div>
        </div>
        <div class="footer">
          CampusCart AI Academic Platform • Automated Security Notification
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `CampusCart AI — Password Reset Verification Code (${otp})`,
      html,
    });
    console.log(`[Gmail OTP Sent] Password reset OTP delivered to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, deliveredViaSmtp: true };
  } catch (error) {
    console.warn(`[Gmail OTP Notice] Could not deliver email to ${toEmail} via SMTP: ${error.message}. Fallback OTP: ${otp}`);
    return { success: true, deliveredViaSmtp: false, warning: error.message };
  }
};

/**
 * Send 1-Click Login OTP to user's Gmail
 */
export const sendLoginOtpEmail = async ({ toEmail, userName, otp }) => {
  const fromEmail = process.env.EMAIL_FROM || '"CampusCart AI" <shibulucky6969@gmail.com>';
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #059669, #10b981); padding: 30px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 30px 24px; }
        .greeting { font-size: 15px; color: #334155; margin-bottom: 16px; line-height: 1.5; }
        .otp-box { background: #ecfdf5; border: 2px dashed #34d399; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
        .otp-title { font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #065f46; letter-spacing: 8px; margin: 6px 0; }
        .otp-note { font-size: 12px; color: #64748b; margin-top: 8px; }
        .warning-card { background: #f8fafc; border-radius: 12px; padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 12px; color: #475569; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CampusCart AI</h1>
          <p>Instant Sign-In Verification Code</p>
        </div>
        <div class="content">
          <div class="greeting">
            Hello <strong>${userName || 'Student'}</strong>,<br>
            Here is your instant login verification code for <strong>CampusCart AI</strong>.
          </div>

          <div class="otp-box">
            <div class="otp-title">Your 6-Digit Sign-In Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-note">Valid for <strong>10 minutes</strong>. Do not share this code.</div>
          </div>

          <div class="warning-card">
            Enter this code on the login page to securely access your student dashboard without entering a password.
          </div>
        </div>
        <div class="footer">
          CampusCart AI Academic Platform • Passwordless Authentication
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `CampusCart AI — Your Sign-In Code (${otp})`,
      html,
    });
    console.log(`[Gmail OTP Sent] Login OTP delivered to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, deliveredViaSmtp: true };
  } catch (error) {
    console.warn(`[Gmail OTP Notice] Could not deliver email to ${toEmail} via SMTP: ${error.message}. Fallback OTP: ${otp}`);
    return { success: true, deliveredViaSmtp: false, warning: error.message };
  }
};

/**
 * Send Student Registration Verification OTP to user's Gmail
 */
export const sendSignupOtpEmail = async ({ toEmail, userName, otp }) => {
  const fromEmail = process.env.EMAIL_FROM || '"CampusCart AI" <shibulucky6969@gmail.com>';
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 30px 24px; }
        .greeting { font-size: 15px; color: #334155; margin-bottom: 16px; line-height: 1.5; }
        .otp-box { background: #eef2ff; border: 2px dashed #6366f1; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
        .otp-title { font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #3730a3; letter-spacing: 8px; margin: 6px 0; }
        .otp-note { font-size: 12px; color: #64748b; margin-top: 8px; }
        .info-card { background: #f8fafc; border-radius: 12px; padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 12px; color: #475569; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CampusCart AI</h1>
          <p>Welcome! Student Account Verification</p>
        </div>
        <div class="content">
          <div class="greeting">
            Hello <strong>${userName || 'Student'}</strong>,<br>
            Thank you for registering on CampusCart AI! Please verify your email to activate your student account.
          </div>

          <div class="otp-box">
            <div class="otp-title">Your 6-Digit Email Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-note">Valid for <strong>10 minutes</strong>. Do not share this code.</div>
          </div>

          <div class="info-card">
            Enter this code on the registration page to activate hostel room delivery and high-speed PDF printing.
          </div>
        </div>
        <div class="footer">
          CampusCart AI Academic Platform • 20-minute hostel room delivery guarantee
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `CampusCart AI — Verify Your Student Email (${otp})`,
      html,
    });
    console.log(`[Gmail OTP Sent] Signup verification OTP delivered to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, deliveredViaSmtp: true };
  } catch (error) {
    console.warn(`[Gmail OTP Notice] Could not deliver email to ${toEmail} via SMTP: ${error.message}. Fallback OTP: ${otp}`);
    return { success: true, deliveredViaSmtp: false, warning: error.message };
  }
};


