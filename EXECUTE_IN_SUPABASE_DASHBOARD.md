# Supabase Database Setup Guide

This guide will help you set up your database by executing the SQL scripts in the Supabase Dashboard.

## Problem Diagnosis

We've detected that your Supabase database doesn't have the required tables and functions set up yet. The test script shows the following issues:

1. Missing tables and functions in your database
2. No SQL functions available to query

## Step-by-Step Setup Instructions

### 1. Log in to Supabase Dashboard

- Go to [https://app.supabase.com](https://app.supabase.com)
- Log in with your credentials
- Select your project: `ndslsadsumxhvnpbkvui`

### 2. Navigate to SQL Editor

- In the left sidebar, click on "SQL Editor"
- Create a new query or use an existing one

### 3. Execute the SQL Scripts in Order

Execute each script in the following order:

#### Step 1: Create Tables and Basic Schema

1. Open `create_tables.sql` from your local project
2. Copy the entire contents
3. Paste into the SQL Editor in Supabase
4. Click "Run" to execute
5. Verify that it completes without errors (you might see some warnings about RLS policies - these are fine)

#### Step 2: Insert Sample Data

1. Open `sample_data.sql` from your local project
2. Copy the entire contents
3. Paste into a new SQL Editor tab in Supabase
4. Click "Run" to execute
5. Verify that it completes without errors

#### Step 3: Add API Functions

1. Open `api_functions.sql` from your local project
2. Copy the entire contents
3. Paste into a new SQL Editor tab in Supabase
4. Click "Run" to execute
5. Verify that it completes without errors

### 4. Verify the Setup

After executing all scripts, you can verify that everything is set up correctly:

1. In the Supabase dashboard, navigate to "Table Editor" in the sidebar
2. You should see all your tables listed:
   - users
   - workouts
   - exercises
   - workout_exercises
   - progress
   - etc.

3. Check that sample data was inserted by clicking on a table and viewing its contents

## Setting Up Management API Access (Optional)

If you want to use the Supabase CLI or Management API:

1. In the Supabase dashboard, click on your avatar in the top-right corner
2. Select "Access Tokens"
3. Click "Generate New Token"
4. Name it something like "Fitness App Development"
5. Copy the token
6. Add it to your `.env` file:
   ```
   SUPABASE_ACCESS_TOKEN=your_token_here
   ```

## Running Your Application

Once your database is set up, you can run your application and it should connect to the Supabase backend successfully:

```bash
npm run dev
```

Your app should now be able to:
- Register and authenticate users
- Create and retrieve workouts
- Track exercise progress
- And all other functionality defined in your API

## Troubleshooting

- If you encounter SQL errors during execution, check the DB_SETUP_README.md file for known issues and fixes
- For any "function already exists" errors, you can uncomment the DROP FUNCTION statements in the scripts
- If tables already exist, you may need to drop them first or handle the conflicts 