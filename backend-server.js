// ═══════════════════════════════════════════════════════════════════
// NODE.JS BACKEND: Send PIN Email via Brevo API
// ═══════════════════════════════════════════════════════════════════
// 
// Deploy on Railway.app - See RAILWAY_SETUP.md for instructions
//
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Brevo API Configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'anilink@ericizx.com';
const SENDER_NAME = 'AniLink';

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

    // Validate Brevo API key
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo API key not configured');
      return res.status(500).json({ 
        error: 'Email service not configured. Set BREVO_API_KEY environment variable.' 
      });
    }

    console.log('📧 Attempting to send PIN via Brevo...');
    console.log('To:', email);

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

    // Call Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: `Your AniLink Security PIN: ${pin}`,
        htmlContent: htmlBody,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Brevo API error: ${response.status}`);
    }

    console.log(`✓ PIN sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: `PIN sent to ${email}`,
    });

  } catch (error) {
    console.error('❌ Error sending PIN:', error.message);
    return res.status(500).json({
      error: `Failed to send PIN: ${error.message}`,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ AniLink PIN Email Service running on port ${PORT}`);
  console.log(`✓ Brevo: ${BREVO_API_KEY ? 'Configured' : 'NOT configured'}`);
  console.log(`✓ Sender: ${SENDER_NAME} <${SENDER_EMAIL}>`);
});

module.exports = app;
