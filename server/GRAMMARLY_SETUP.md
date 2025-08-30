# Grammarly AI Detection API Setup

This application uses the official Grammarly AI Detection API to detect AI-generated content in text descriptions and comments.

## Setup Instructions

### 1. Get Grammarly API Access

1. Visit [Grammarly AI Detection API](https://developer.grammarly.com/ai-detection-api.html)
2. Sign up for Grammarly Enterprise or contact Grammarly for API access
3. Create OAuth 2.0 credentials
4. Get your Access Token with the required scopes:
   - `ai-detection-api:read`
   - `ai-detection-api:write`

### 2. Environment Configuration

Add your Grammarly access token to your environment variables:

```bash
# Add this to your .env file
GRAMMARLY_ACCESS_TOKEN=your_grammarly_access_token_here
```

### 3. API Features

The Grammarly AI Detection API provides:

- **Document Analysis**: Analyzes text files for AI-generated content
- **Confidence Scoring**: Provides confidence levels for AI detection
- **Percentage Analysis**: Shows what percentage of text appears AI-generated
- **Supported Formats**: .doc, .docx, .odt, .txt, .rtf
- **File Size Limit**: 4 MB maximum
- **Text Length**: 30 words minimum, 100,000 characters maximum

### 4. Rate Limits

- **POST requests**: 10 requests per second
- **GET requests**: 50 requests per second
- **Score Retention**: 30 days

### 5. Error Handling

The application handles common API errors:

- **401**: Authentication failed
- **429**: Rate limit exceeded
- **File size exceeded**: Documents larger than 4 MB
- **Content length exceeded**: Text longer than 100,000 characters

### 6. Implementation Details

The AI detection is used for:

- **Post Descriptions**: Analyzes the main description text
- **Comments**: Analyzes user comments for AI-generated content
- **Non-blocking**: If AI detection fails, content is still posted

### 7. Testing

To test the API integration:

1. Ensure your access token is valid
2. Create a post with a description longer than 30 words
3. Add a comment with sufficient text
4. Check that AI detection badges appear when content is flagged

### 8. Troubleshooting

If AI detection is not working:

1. Check your access token is valid
2. Verify you have the correct scopes
3. Check the server logs for API errors
4. Ensure text meets minimum length requirements (30 words)
5. Verify network connectivity to Grammarly API endpoints

## API Documentation

For detailed API documentation, visit:
https://developer.grammarly.com/ai-detection-api.html
