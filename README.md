# Fitness Tracking App - Database Setup

This repository contains scripts for setting up and verifying the database for the fitness tracking application.

## Database Structure

The database consists of the following tables:

- **users**: Extends Supabase auth.users with additional profile information
- **workouts**: Stores workout sessions for users
- **exercises**: Contains exercise definitions with instructions
- **workout_exercises**: Junction table connecting workouts and exercises with sets/reps details
- **progress**: Tracks user body measurements and progress over time

## Setting Up the Database

### Option 1: Using the SQL Script

1. Log in to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `db_setup.sql` and paste it into the SQL Editor
4. Run the script to create all tables, policies, triggers, and sample data

### Option 2: Using Supabase Migrations

If you're using Supabase CLI for migrations:

```bash
supabase migration new create_initial_schema
# Copy the db_setup.sql content into the created migration file
supabase db push
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Verifying the Database

Run the database verification script to check if all required tables exist:

```bash
node verify_db.js
```

The script will check for the existence of all required tables and report any issues.

## Row Level Security (RLS)

The database has RLS policies set up to ensure users can only access their own data:

- Users can only see and modify their own profile information
- Users can only see and modify their own workouts and associated exercises
- All users can view the exercises catalog but not modify it (admin only)
- Users can only see and modify their own progress data

## Automatic User Creation

When a new user signs up through Supabase Auth, a trigger automatically creates a corresponding entry in the `users` table with basic profile information.

## Sample Data

The setup script includes some sample exercise data to get you started. You can modify or extend this data as needed.

# FitMaxxer 9000 - Fitness Tracking App

A comprehensive fitness tracking application built with Next.js and Supabase, focused on workout tracking, nutrition logging, and fitness progress analytics.

## Features

- **Workout Management**: Create, view, and execute custom workouts
- **Exercise Library**: Extensive database of exercises with descriptions
- **Nutrition Tracking**: Log meals and monitor nutritional intake
- **Progress Analytics**: Track fitness metrics over time
- **User Authentication**: Secure login and user-specific data

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **API**: REST API with direct Supabase queries

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fit-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up the Supabase database:
   - Run the SQL scripts in the `sql/` directory through the Supabase dashboard

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app`: Next.js app router structure
- `src/components`: Reusable React components
- `src/lib`: Utility functions, API calls, and context providers
- `sql/`: SQL scripts for database setup

## Documentation

- [API Documentation](API_DOCUMENTATION.md): Details about the app's API endpoints
- [Cleanup Summary](CLEANUP_SUMMARY.md): Summary of recent codebase cleanup

## License

MIT 