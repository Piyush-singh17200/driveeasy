const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const templates = {
  welcome: (data) => ({
    subject: 'Welcome to DriveEasy! 🚗',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
        <div style="background:#1a1a2e;padding:30px;border-radius:12px;text-align:center;">
          <h1 style="color:#e94560;margin:0;">DriveEasy</h1>
          <p style="color:#ccc;margin:5px 0 0;">Smart Car Rental</p>
        </div>
        <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;">
          <h2>Welcome, ${data.name}! 🎉</h2>
          <p>Thank you for joining DriveEasy. You can now browse and book cars instantly.</p>
          <a href="${process.env.CLIENT_URL}/cars" style="display:inline-block;background:#e94560;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Browse Cars</a>
        </div>
      </div>
    `,
  }),

  bookingConfirmation: (data) => ({
    subject: `Booking Confirmed - ${data.carName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#1a1a2e;padding:30px;border-radius:12px;text-align:center;">
          <h1 style="color:#e94560;margin:0;">DriveEasy</h1>
        </div>
        <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;border:1px solid #eee;">
          <h2>Booking Confirmed! ✅</h2>
          <p>Hi ${data.userName}, your booking is confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Car</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.carName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">From</td><td style="padding:8px;border-bottom:1px solid #eee;">${new Date(data.startDate).toDateString()}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">To</td><td style="padding:8px;border-bottom:1px solid #eee;">${new Date(data.endDate).toDateString()}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Total</td><td style="padding:8px;color:#e94560;font-size:1.2em;">₹${data.totalAmount.toLocaleString()}</td></tr>
          </table>
          <a href="${process.env.CLIENT_URL}/bookings/${data.bookingId}" style="display:inline-block;background:#e94560;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:20px;">View Booking</a>
        </div>
      </div>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset - DriveEasy',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${data.name}, click below to reset your password. This link expires in 10 minutes.</p>
        <a href="${data.resetUrl}" style="display:inline-block;background:#e94560;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
        <p style="color:#999;margin-top:20px;font-size:0.8em;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  }),
};

exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templateData = templates[template]?.(data) || { subject, html: `<p>${data?.message || ''}</p>` };

    await transporter.sendMail({
      from: `"DriveEasy" <${process.env.EMAIL_USER}>`,
      to,
      subject: templateData.subject || subject,
      html: templateData.html,
    });

    logger.info(`Email sent to ${to}: ${templateData.subject}`);
  } catch (error) {
    logger.error(`Email error to ${to}:`, error.message);
    throw error;
  }
};
