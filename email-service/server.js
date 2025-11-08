const http = require('http');
const nodemailer = require('nodemailer');
const querystring = require('querystring');

// Configuration
const PORT = 3001;
const TO_EMAIL = 'wordofguidance@gmail.com';
const FROM_EMAIL = 'wordofguidancemailer@gmail.com';
const GMAIL_APP_PASSWORD = 'hjfs pbun qpuc bteb';
const SITE_NAME = 'Word of Guidance';

// Rate limiting - simple in-memory store
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // 3 requests per minute per IP

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FROM_EMAIL,
    pass: GMAIL_APP_PASSWORD
  }
});

// Helper function to check rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];

  // Remove old requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return true; // Within rate limit
}

// Helper function to parse POST body
function parsePostData(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    callback(querystring.parse(body));
  });
}

// Helper function to send email using Gmail SMTP
function sendEmail(name, email, subject, message, callback) {
  const mailOptions = {
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    to: TO_EMAIL,
    replyTo: email,
    subject: `[${SITE_NAME} Contact Form] ${subject}`,
    text: `New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Reply directly to this email to respond to ${name} at ${email}`,
    html: `<h3>New contact form submission</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Subject:</strong> ${subject}</p>
<h4>Message:</h4>
<p>${message.replace(/\n/g, '<br>')}</p>
<hr>
<p><em>Reply directly to this email to respond to ${name}</em></p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error.toString(), null);
    } else {
      callback(null, 'Email sent: ' + info.messageId);
    }
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only accept POST requests to /send-email
  if (req.method === 'POST' && req.url === '/send-email') {
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      res.writeHead(429);
      res.end(JSON.stringify({
        success: false,
        message: 'Too many requests. Please try again later.'
      }));
      return;
    }

    parsePostData(req, (data) => {
      const { name, email, subject, message = 'No message provided', website, captcha, captchaAnswer } = data;

      // Check honeypot - if filled, it's a bot
      if (website) {
        console.log('Bot detected via honeypot from IP:', clientIP);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Spam detected'
        }));
        return;
      }

      // Validate CAPTCHA
      if (!captcha || !captchaAnswer || captcha !== captchaAnswer) {
        console.log('Invalid CAPTCHA from IP:', clientIP);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid security answer'
        }));
        return;
      }

      // Validate required fields
      if (!name || !email || !subject) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Missing required fields'
        }));
        return;
      }

      // Basic email validation
      if (!email.includes('@') || !email.includes('.')) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid email address'
        }));
        return;
      }

      // Send email
      sendEmail(name, email, subject, message, (error, result) => {
        if (error) {
          console.error('Error sending email:', error);
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            message: 'Failed to send email'
          }));
        } else {
          console.log('Email sent:', result);
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: 'Email sent successfully'
          }));
        }
      });
    });
  } else {
    // Invalid endpoint
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      message: 'Not found'
    }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Email service running on http://localhost:${PORT}`);
  console.log(`Sending emails to: ${TO_EMAIL}`);
});
