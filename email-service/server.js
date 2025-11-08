const http = require('http');
const { spawn } = require('child_process');
const url = require('url');
const querystring = require('querystring');

// Configuration
const PORT = 3001;
const TO_EMAIL = 'wordofguidance@gmail.com';
const SITE_NAME = 'Word of Guidance';

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

// Helper function to send email using mail command
function sendEmail(name, email, subject, message, callback) {
  const emailSubject = `[${SITE_NAME} Contact Form] ${subject}`;
  const emailBody = `New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
`;

  // Spawn mail command
  const mail = spawn('mail', [
    '-s', emailSubject,
    '-r', `${SITE_NAME} <noreply@localhost>`,
    TO_EMAIL
  ]);

  // Send email body to mail command
  mail.stdin.write(emailBody);
  mail.stdin.end();

  let stderr = '';
  mail.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  mail.on('close', (code) => {
    if (code === 0) {
      callback(null, 'Email sent successfully');
    } else {
      callback(`Mail command failed with code ${code}: ${stderr}`, null);
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
    parsePostData(req, (data) => {
      const { name, email, subject, message = 'No message provided' } = data;

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
