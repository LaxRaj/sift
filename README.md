# Sift - AI Email Summarizer

A monorepo workspace for an AI-first email intelligence platform built with NestJS backend and Expo (React Native) frontend.

## Project Structure

```
sift/
├── backend/          # NestJS backend API
│   ├── src/
│   │   ├── core/    # Shared types and interfaces
│   │   └── ...
│   └── .env.template
├── mobile/          # Expo React Native frontend
│   ├── app/         # Expo Router pages
│   ├── theme/       # Theme configuration
│   └── ...
├── supabase/        # Database schema and migrations
│   └── seed.sql
├── docker-compose.yml
└── .cursorrules
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for Redis)
- Supabase account (for database)
- Nylas account (for email integration)
- OpenAI API key

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install

# Install Nylas SDK (check Nylas docs for correct package name)
# npm install <nylas-package-name>

# Copy environment template
cp .env.template .env
# Fill in your API keys in .env
```

### 2. Frontend Setup

```bash
cd mobile
npm install

# Install Nylas Expo SDK (check Nylas docs for correct package name)
# npm install <nylas-expo-package-name>
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL from `supabase/seed.sql` in your Supabase SQL editor
3. Update your backend `.env` with Supabase credentials

### 4. Infrastructure

Start Redis locally:

```bash
docker-compose up -d
```

## Development

### Backend

```bash
cd backend
npm run start:dev
```

### Frontend

```bash
cd mobile
npm start
```

## Tech Stack

- **Backend:** NestJS, TypeScript
- **Frontend:** Expo (React Native), Expo Router
- **Database:** Supabase (PostgreSQL)
- **Email:** Nylas SDK
- **AI:** OpenAI (gpt-4o-mini)
- **Background Jobs:** BullMQ + Redis

## Notes

- The Nylas SDK package names may need to be verified from the official Nylas documentation
- Ensure all environment variables are set before running the applications
- RLS policies are configured in the database schema for security
