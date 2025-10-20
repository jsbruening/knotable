# Knotable - Gamified Learning Platform

A full-stack web app built with the T3 stack (Next.js, TypeScript, Tailwind CSS, tRPC, Prisma) featuring Supabase integration for authentication, database, storage, and real-time functionality.

## 🎯 Features

- **AI-Generated Campaigns**: Learning campaigns structured around Bloom's Taxonomy
- **Team Collaboration**: Real-time chat, team challenges, and collaborative learning
- **Gamification**: Points, badges, kudos system, and unlockables
- **Supabase Integration**: Authentication (GitHub + Google), storage, and real-time features
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- PostgreSQL database (or use Supabase's hosted database)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd knotable
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres.eyplrlnfdsnfwtyzanac:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.eyplrlnfdsnfwtyzanac:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

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

# OpenAI (for AI features)
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 4. Supabase Configuration

1. Create a new Supabase project
2. Enable GitHub and Google OAuth providers in Authentication settings
3. Configure OAuth redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
4. Create storage buckets for avatars and team banners
5. Enable real-time subscriptions for team chat

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── onboarding/        # Onboarding wizard
│   └── ...
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
├── server/               # tRPC server-side code
│   ├── api/              # API routes and routers
│   └── db.ts             # Database connection
└── trpc/                 # tRPC client configuration
```

## 🎮 Core Concepts

### Campaigns
- Created by admins using AI prompts
- Structured around Bloom's Taxonomy (6 levels)
- Each level has objectives, resources, and quizzes
- Users progress through milestones

### Teams
- Users can create or join teams
- Real-time chat functionality
- Team challenges and collaboration
- Kudos leaderboard

### Gamification
- **Points**: Earned for milestones, kudos, challenges
- **Badges**: Achievement-based rewards
- **Kudos**: "I owe you a beverage" system
- **Unlockables**: Profile themes, avatars, skip tokens

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your-migration-name
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to update these for production:
- `NEXTAUTH_URL` to your production domain
- OAuth redirect URLs in Supabase
- Database URLs (if using different database)

## 📚 API Documentation

The API is built with tRPC and provides type-safe endpoints:

- `auth.*` - User authentication and profile management
- `campaign.*` - Campaign creation, joining, and management
- `team.*` - Team operations and real-time chat
- `gamification.*` - Points, badges, kudos, and unlockables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord (if available)

---

Built with ❤️ using the T3 Stack