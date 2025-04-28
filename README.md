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

This project is a fitness tracking application built with Next.js and Supabase.

## Setup Instructions

### Database Setup

1. Log in to the [Supabase Dashboard](https://app.supabase.com) and select your project.
2. Go to the SQL Editor in the left sidebar.
3. Run the following SQL scripts in order:
   - `sql/auth_setup_fix.sql` (creates authentication tables and functions)
   - `sql/add_test_user.sql` (creates a test user with sample data)

### Environment Variables

Make sure your `.env` file has the following variables:

```
# Supabase configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_ACCESS_TOKEN=your-access-token

# For Next.js compatibility
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test User

A test user is created with the following credentials:

- Email: satyajit.kumthekar@gmail.com
- Password: password123

This user has sample data for workouts, progress tracking, and nutrition logs.

## Features

- User authentication with Supabase
- Workout tracking
- Nutrition logging
- Progress tracking
- Fitness analytics

## Technologies Used

- Next.js
- React
- TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS 