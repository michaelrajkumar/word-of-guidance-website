# Word of Guidance Website

A Christian ministry website offering spiritual resources to help individuals receive Peace from the Lord Jesus Christ.

## About

This website provides:
- Faith-based guidance for jobseekers
- Tele-counseling for professionals on work and life balance
- Support through personal crises
- Advice on Christian marriage
- Free articles, audio and video messages on Christian living
- Information on job vacancies, career development, and networking opportunities

## Technology Stack

- **Static Site Generator**: Hugo (v0.149.0+)
- **Languages**: HTML, CSS, JavaScript
- **Email Service**: Node.js + System mail command
- **Web Server**: Hiawatha
- **Hosting**: Self-hosted
- **Languages**: English & Hindi

## Project Structure

```
word-of-guidance-in/
├── archetypes/          # Hugo content templates
├── content/             # Markdown content files
│   ├── *.md            # English content
│   └── *.hi.md         # Hindi content
├── email-service/       # Node.js email service
│   ├── server.js       # Email backend
│   └── *.service       # Systemd service file
├── layouts/            # Hugo templates
├── static/             # Static assets (PDFs, images, etc.)
├── config.toml         # Hugo configuration
└── send-email-cgi.sh   # CGI script for email handling
```

## Local Development

### Prerequisites
- Hugo (extended version)
- Node.js (for email service)

### Build the Site
```bash
hugo
```

### Preview Locally
```bash
hugo server -D
```

Visit: http://localhost:1313

## Deployment

The site is deployed to a self-hosted server using rsync:

```bash
hugo                    # Build the site
rsync -avz public/ user@server:/var/www/wordofguidance.in/
```

## Email Service

The contact form uses a 3-tier architecture:
1. Frontend form (HTML/JavaScript)
2. CGI bridge script (Bash)
3. Node.js email service (port 3001, localhost only)

All contact form submissions are sent to: wordofguidance@gmail.com

## License

This website is maintained for ministry purposes with no commercial intent.

## Contact

For queries, feedback, or testimonies: wordofguidance@gmail.com

## Credits

Website maintained by Anand David
Ministry based in New Delhi, India

---

*"Your ears shall hear a word behind you, saying, 'This is the way, walk in it,' when you turn to the right or when you turn to the left." (Isaiah 30:21)*
