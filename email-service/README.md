# Email Service for Static Site

Simple Node.js backend service to handle contact form submissions and send emails using the server's `mail` command.

## Prerequisites

1. **Node.js** - Install on Debian:
   ```bash
   sudo apt-get update
   sudo apt-get install nodejs npm
   ```

2. **Mail command** - Install mailutils:
   ```bash
   sudo apt-get install mailutils
   ```

3. **Hiawatha web server** with ReverseProxy support

## Installation

### 1. Deploy the email service

Copy the `email-service` folder to your server:
```bash
sudo mkdir -p /var/www/email-service
sudo cp server.js package.json /var/www/email-service/
sudo chown -R www-data:www-data /var/www/email-service
```

### 2. Test the service manually

```bash
cd /var/www/email-service
node server.js
```

You should see: `Email service running on http://localhost:3001`

Test it in another terminal:
```bash
curl -X POST http://localhost:3001/send-email \
  -d "name=Test User&email=test@example.com&subject=Test&message=Hello"
```

### 3. Set up as a system service

```bash
# Copy the service file
sudo cp word-of-guidance-email.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable word-of-guidance-email
sudo systemctl start word-of-guidance-email

# Check status
sudo systemctl status word-of-guidance-email
```

### 4. Configure Hiawatha

Edit your Hiawatha configuration (usually `/etc/hiawatha/hiawatha.conf`):

```
VirtualHost {
    Hostname = wordofguidance.in
    WebsiteRoot = /var/www/html
    StartFile = index.html

    # Add this line to proxy email requests
    ReverseProxy /send-email http://localhost:3001/send-email
}
```

Restart Hiawatha:
```bash
sudo systemctl restart hiawatha
```

### 5. Deploy your Hugo site

Build your site:
```bash
hugo
```

Upload the `public/` folder to `/var/www/html` on your server.

## Testing

1. Visit your contact page
2. Fill out the form
3. Submit
4. Check `ananddavidonly@yahoo.com` for the email

## Troubleshooting

### Check service logs
```bash
sudo journalctl -u word-of-guidance-email -f
```

### Test mail command manually
```bash
echo "Test" | mail -s "Test Subject" ananddavidonly@yahoo.com
```

### Check if service is running
```bash
sudo systemctl status word-of-guidance-email
curl http://localhost:3001/send-email
```

### Check Hiawatha logs
```bash
sudo tail -f /var/log/hiawatha/access.log
sudo tail -f /var/log/hiawatha/error.log
```

## Configuration

Edit `/var/www/email-service/server.js` to change:
- `PORT` - Default is 3001
- `TO_EMAIL` - Recipient email address
- `SITE_NAME` - Site name for email headers

After changes, restart the service:
```bash
sudo systemctl restart word-of-guidance-email
```

## Security Notes

- The service only accepts POST requests to `/send-email`
- Basic input validation is performed
- CORS is enabled (restrict in production if needed)
- Runs as `www-data` user (limited permissions)
- No sensitive credentials in code
