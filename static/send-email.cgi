#!/bin/bash

# CGI wrapper for email service
# This forwards POST requests to the Node.js email service

# Read POST data
read -n $CONTENT_LENGTH POST_DATA

# Forward to Node.js service
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "$POST_DATA" \
  http://localhost:3001/send-email)

# Output HTTP headers
echo "Content-Type: application/json"
echo ""

# Output response
echo "$RESPONSE"
