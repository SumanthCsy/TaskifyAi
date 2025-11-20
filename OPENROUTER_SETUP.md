# OpenRouter API Setup Guide

## Getting Your OpenRouter API Key

The "User not found" error occurs when the OpenRouter API key is invalid, expired, or doesn't exist in OpenRouter's system.

### Steps to Fix:

1. **Get a Valid API Key from OpenRouter:**
   - Go to https://openrouter.ai/
   - Sign up or log in to your account
   - Navigate to https://openrouter.ai/keys
   - Create a new API key
   - Copy the key (it should start with `sk-or-v1-`)

2. **Set the API Key in Your Environment:**

   For **local development**:
   ```bash
   # Create or update your .env file
   echo "OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE" > .env
   ```

   For **production** (Render, Vercel, etc.):
   - Go to your hosting platform's dashboard
   - Navigate to Environment Variables settings
   - Add a new environment variable:
     - Key: `OPENROUTER_API_KEY`
     - Value: `sk-or-v1-YOUR_ACTUAL_KEY_HERE`
   - Redeploy your application

3. **Verify the API Key is Set:**
   ```bash
   # Check if the key is loaded
   curl http://localhost:5000/api/config/status
   ```

## Important Notes

- **Token Limits Removed**: All token limits have been significantly increased:
  - `generateAiResponse`: 8,000 tokens (was 1,200)
  - `generateReportContent`: 16,000 tokens (was 4,000)
  - `getSuggestedPrompts`: 4,000 tokens (was 1,000)

- **Model Updated**: Changed from `claude-2` and `claude-3-haiku` to `claude-3.5-sonnet` for better performance and availability.

- **API Key Format**: The key must start with `sk-or-v1-` or it will be rejected.

- **Error Handling**: Improved error messages will now guide you to the correct solution when authentication fails.

## Troubleshooting

If you still see "User not found" error:

1. **Verify your API key is valid:**
   - Log in to https://openrouter.ai/keys
   - Check if your key is still active
   - Generate a new key if needed

2. **Check if the key is properly set:**
   ```bash
   # On Linux/Mac
   echo $OPENROUTER_API_KEY
   
   # On Windows PowerShell
   echo $env:OPENROUTER_API_KEY
   ```

3. **Restart your application** after setting the environment variable

4. **Check for typos** in the environment variable name (must be exactly `OPENROUTER_API_KEY`)

## API Key Security

- **Never commit** your API key to Git
- The `.env` file is already in `.gitignore`
- Use environment variables in production
- Rotate your API key regularly for security
