# Supabase Setup Guide

This guide explains how to set up your Supabase database for the FitMaxxer 9000 application.

## Automated Setup

1. Make sure your `.env` file contains the correct Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Install the required dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. Run the setup script:
   ```bash
   node setup-database.js
   ```

## Manual Setup

If the automated setup fails, you can set up the database manually:

1. Log in to the [Supabase Dashboard](https://app.supabase.com).

2. Select your project.

3. Go to the SQL Editor in the left sidebar.

4. Create a new query and paste the contents of `sql/auth_functions.sql`.

5. Click "Run" to execute the SQL statements.

## Verifying the Setup

To verify that the setup was successful:

1. In the Supabase Dashboard, go to the "Table Editor" in the left sidebar.

2. You should see a `users` table.

3. Go to the "Database Functions" section in the left sidebar.

4. You should see three functions:
   - `register_user`
   - `authenticate_user`
   - `get_user_profile`

## Troubleshooting

If you encounter issues with the setup:

1. **Error: pgcrypto extension not available**
   - Solution: Go to the "Database" section, then "Extensions" and enable the pgcrypto extension.

2. **Error: Invalid API key**
   - Check that your `.env` file contains the correct Supabase URL and API keys.
   - Make sure you're using the service role key for the setup script.

3. **Error: RLS policy errors**
   - Solution: Check the Row Level Security policies in the "Authentication" section.

## Database Schema

The setup creates the following:

1. **users table** - Stores user information:
   - `id` - UUID, primary key
   - `email` - Text, unique
   - `password_hash` - Text, stores bcrypt hashed passwords
   - `full_name` - Text
   - `username` - Text, unique
   - `bio` - Text
   - `profile_image_url` - Text
   - `created_at` - Timestamp
   - `updated_at` - Timestamp

2. **register_user function** - Creates a new user:
   - Parameters: email, password, full_name, username (optional)
   - Returns: UUID of the created user

3. **authenticate_user function** - Validates user credentials:
   - Parameters: email, password
   - Returns: User data as JSONB if credentials are valid

4. **get_user_profile function** - Retrieves user profile data:
   - Parameters: user_id
   - Returns: User profile data as JSONB 