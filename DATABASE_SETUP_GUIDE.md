# Database Setup Guide

## Setting up your Supabase Database Tables

Our verification indicates that the tables don't exist in your database yet. Follow these steps to create them:

1. **Login to your Supabase Dashboard**
   - Go to https://app.supabase.com/
   - Select your project

2. **Navigate to the SQL Editor**
   - On the left sidebar, click on "SQL Editor"
   - Click "New Query" to create a new SQL query

3. **Execute the SQL Commands**
   - Copy the entire contents of the `create_tables.sql` file provided in this project
   - Paste it into the SQL Editor
   - Click "Run" to execute the commands

4. **Verify the Tables**
   - On the left sidebar, click on "Table Editor"
   - You should now see all the created tables: `users`, `workouts`, `exercises`, `workout_exercises`, and `progress`

## Troubleshooting

If you encounter any issues:

1. **Check for errors in the SQL output**
   - The SQL Editor will display any errors that occurred during execution

2. **Verify your Supabase connection**
   - Ensure your `.env` file has the correct Supabase URL and API keys

3. **Run the verify script**
   - After creating the tables, run `npm run verify` to test the connection and basic operations

## Database Schema

Our fitness app database includes the following tables:

- **users**: Stores user account information and profiles
- **workouts**: Tracks workout sessions created by users
- **exercises**: Contains a library of available exercises
- **workout_exercises**: Junction table linking workouts to exercises with specific parameters
- **progress**: Tracks user fitness progress metrics over time

Each table includes appropriate timestamps and relationships for a complete fitness tracking application. 