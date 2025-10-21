# Vercel Deployment Guide

## Environment Variables Setup

To deploy this application to Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **Database Configuration**
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `DIRECT_URL`: Direct database connection string (optional, same as DATABASE_URL)

2. **Supabase Configuration**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. **NextAuth Configuration**
   - `NEXTAUTH_SECRET`: A random secret key for NextAuth (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)

4. **OAuth Providers**
   - `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
   - `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
   - `GOOGLE_CLIENT_ID`: Google OAuth app client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth app client secret

5. **AI API Keys**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_API_BASE`: OpenAI API base URL (optional, defaults to `https://api.openai.com/v1`)
   - `OPENAI_API_VERSION`: OpenAI API version (optional)

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each environment variable with its corresponding value
4. Make sure to set them for the "Production" environment
5. Redeploy your application

### Build Configuration

The application is configured to skip environment validation during the build process in production, which allows Vercel to build the application even if environment variables are not set at build time. The validation will still occur at runtime when the application starts.

### Troubleshooting

If you encounter build errors related to environment variables:
1. Ensure all required environment variables are set in Vercel
2. Check that the environment variables are set for the correct environment (Production)
3. Verify that the values are correct and properly formatted
4. Redeploy the application after making changes

### Security Notes

- Never commit actual environment variable values to your repository
- Use the `.env.example` file as a template for local development
- Generate strong, unique values for `NEXTAUTH_SECRET`
- Keep your API keys secure and rotate them regularly
