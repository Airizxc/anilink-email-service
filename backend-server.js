// ═══════════════════════════════════════════════════════════════════
// NODE.JS BACKEND: Send PIN Email via Gmail SMTP
// ═══════════════════════════════════════════════════════════════════
// 
// Deploy on Railway.app - See RAILWAY_SETUP.md for instructions
//
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gmail transporter with timeout settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  connectionTimeout: 10000,  // 10 seconds
  socketTimeout: 10000,      // 10 seconds
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server running', service: 'AniLink PIN Email Service' });
});

// Send PIN endpoint
app.post('/send-pin', async (req, res) => {
  try {
    const { email, pin, validity_minutes } = req.body;

    // Validate input
    if (!email || !pin) {
      return res.status(400).json({ error: 'Email and PIN required' });
    }

    // Validate Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({ 
        error: 'Email service not configured. Set GMAIL_USER and GMAIL_PASSWORD environment variables.' 
      });
    }

    // Email HTML template
    const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto;">
  <h2 style="color: #2d5016;">Your AniLink Security PIN</h2>
  
  <p>Hello,</p>
  
  <p>Your 6-digit security PIN is:</p>
  
  <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
    <strong style="font-size: 32px; letter-spacing: 4px; color: #2d5016;">${pin}</strong>
  </div>
  
  <p>This PIN will expire in ${validity_minutes} minutes.</p>
  
  <p style="color: #666; font-size: 12px;">
    If you didn't request this PIN, please ignore this email.
  </p>
  
  <footer style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #999; font-size: 12px;">
    <p>AniLink | Farm-to-Kitchen Marketplace</p>
    <p>© 2026 AniLink. All rights reserved.</p>
  </footer>
</div>`;

    // Send email
    await transporter.sendMail({
      from: `AniLink <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your AniLink Security PIN: ${pin}`,
      html: htmlBody,
    });

    console.log(`✓ PIN sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: `PIN sent to ${email}`,
    });

  } catch (error) {
    console.error('Error sending PIN:', error.message);
    return res.status(500).json({
      error: `Failed to send PIN: ${error.message}`,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ AniLink PIN Email Service running on port ${PORT}`);
  console.log(`✓ Gmail: ${process.env.GMAIL_USER ? 'Configured' : 'NOT configured'}`);
});

module.exports = app;
