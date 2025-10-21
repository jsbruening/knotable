@echo off
echo 🎯 Setting up Knotable - Gamified Learning Platform
echo ==================================================

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    (
        echo # Database
        echo DATABASE_URL="postgresql://postgres.eyplrlnfdsnfwtyzanac:OlF80boeAvvgA2Wj@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
        echo DIRECT_URL="postgresql://postgres.eyplrlnfdsnfwtyzanac:OlF80boeAvvgA2Wj@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
        echo.
        echo # Supabase
        echo NEXT_PUBLIC_SUPABASE_URL="https://eyplrlnfdsnfwtyzanac.supabase.co"
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
        echo SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
        echo.
        echo # NextAuth.js
        echo NEXTAUTH_SECRET="your-nextauth-secret"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo.
        echo # GitHub OAuth
        echo GITHUB_CLIENT_ID="your-github-client-id"
        echo GITHUB_CLIENT_SECRET="your-github-client-secret"
        echo.
        echo # Google OAuth
        echo GOOGLE_CLIENT_ID="your-google-client-id"
        echo GOOGLE_CLIENT_SECRET="your-google-client-secret"
        echo.
        echo # OpenAI ^(for Copilot integration^)
        echo OPENAI_API_KEY="your-openai-api-key"
    ) > .env
    echo ✅ .env file created!
    echo ⚠️  Please update the .env file with your actual Supabase credentials
) else (
    echo ✅ .env file already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update your .env file with Supabase credentials
echo 2. Configure OAuth providers in Supabase dashboard
echo 3. Run: npm run dev
echo.
echo For detailed setup instructions, see README.md
pause



