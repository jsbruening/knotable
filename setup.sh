#!/bin/bash

echo "🎯 Setting up Knotable - Gamified Learning Platform"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres.eyplrlnfdsnfwtyzanac:OlF80boeAvvgA2Wj@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.eyplrlnfdsnfwtyzanac:OlF80boeAvvgA2Wj@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://eyplrlnfdsnfwtyzanac.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (for Copilot integration)
OPENAI_API_KEY="your-openai-api-key"
EOF
    echo "✅ .env file created!"
    echo "⚠️  Please update the .env file with your actual Supabase credentials"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with Supabase credentials"
echo "2. Configure OAuth providers in Supabase dashboard"
echo "3. Run: npm run dev"
echo ""
echo "For detailed setup instructions, see README.md"



