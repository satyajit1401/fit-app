# Fitness App Database Setup

This guide explains how to set up the Supabase database for the fitness tracking application.

## Database Schema Overview

The database consists of the following key tables:

- **Users**: User accounts and profile information
- **Workouts**: Workout definitions created by users
- **Exercises**: Exercise definitions (predefined and user-created)
- **Workout_exercises**: Links exercises to workouts with sets, reps, etc.
- **Progress**: User progress tracking (weight, body fat, etc.)
- **Workout_sessions**: Records of workout completions
- **Nutrition_log**: Food and nutrition tracking
- **Workout_plans**: Structured workout programs
- **Social features**: Follows, comments, likes, etc.

## Setup Instructions

### Prerequisites

- Supabase account with a project created
- The Supabase project URL and API keys in your `.env` file

### Option 1: Using SQL Scripts (Recommended)

1. **Log into Supabase Dashboard**:
   - Go to https://app.supabase.com
   - Select your project

2. **Run the Schema Creation Script**:
   - Navigate to the SQL Editor
   - Copy the contents of `create_tables.sql` and execute it
   - This will create all tables with proper relationships and security policies
   - **IMPORTANT FIX**: The SQL file has been updated to fix the "column must appear in the GROUP BY clause" error in the `get_workout_details` function. Make sure you're using the latest version.

3. **Insert Sample Data**:
   - Copy the contents of `sample_data.sql` and execute it
   - This will insert sample exercises, users, workouts, and other data

4. **Set up API Functions**:
   - Copy the contents of `api_functions.sql` and execute it
   - This will create stored procedures for common operations
   - **IMPORTANT FIX**: The SQL file has been updated to fix the "column must appear in the GROUP BY clause" error in the function.

5. **Verify Setup**:
   - Run the `verify_tables.js` script from your terminal:
   ```
   node verify_tables.js
   ```
   - The script will check that all tables exist and test basic operations

### Option 2: Using Supabase Migrations (For Development)

1. **Install Supabase CLI**:
   ```
   npm install supabase --save-dev
   ```

2. **Initialize Supabase**:
   ```
   npx supabase init
   ```

3. **Create Migrations**:
   ```
   npx supabase migration new initial_schema
   npx supabase migration new sample_data
   npx supabase migration new api_functions
   ```

4. **Add SQL to Migration Files**:
   - Copy the content from `create_tables.sql` into the initial_schema migration file
   - Copy the content from `sample_data.sql` into the sample_data migration file
   - Copy the content from `api_functions.sql` into the api_functions migration file

5. **Apply Migrations**:
   You'll need to log in to Supabase and link your project:
   ```
   npx supabase login
   npx supabase link --project-ref <your-project-reference>
   npx supabase db push
   ```

## Database Architecture Details

### Row Level Security (RLS)

All tables have Row Level Security enabled to ensure users can only access their own data. The security policies are set up so that:

- Users can only read and modify their own profile data
- Workouts can be public (viewable by all) or private (only viewable by the creator)
- Progress data is strictly private to each user
- API functions use `SECURITY DEFINER` to ensure proper access control

### Database Views

The setup includes several useful views:

- `workout_stats`: Aggregates statistics about workouts (times performed, ratings, etc.)
- `user_stats`: Aggregates statistics about users (workouts completed, calories burned, etc.)

### Database Functions

The API functions include:

- User registration and authentication
- Profile management
- Workout creation and retrieval
- Progress tracking
- Workout completion logging
- Search and recommendation functions

## Troubleshooting

### SQL Error: "column must appear in GROUP BY clause or be used in an aggregate function"

If you encounter this error:
```
ERROR:  42803: column "we.position" must appear in the GROUP BY clause or be used in an aggregate function
LINE 592:       ORDER BY we.position
```

This has been fixed in the current SQL files by reorganizing the query to use a subquery for ordering before aggregation:

```sql
SELECT jsonb_agg(...)
FROM (
  SELECT * FROM workout_exercises 
  WHERE workout_id = w.id
  ORDER BY position
) we
JOIN exercises e ON we.exercise_id = e.id
```

If you're still seeing this error, make sure you're using the latest versions of the SQL files.

### SQL Error: "cannot change name of input parameter"

If you encounter this error:
```
ERROR:  42P13: cannot change name of input parameter "user_id"
HINT:  Use DROP FUNCTION get_user_profile(uuid) first.
```

This happens because PostgreSQL doesn't allow you to change parameter names when using `CREATE OR REPLACE FUNCTION`. To fix this:

1. The updated SQL files now include `DROP FUNCTION IF EXISTS` statements before function definitions to handle this case.

2. If you manually need to fix this error:
   ```sql
   -- First drop the existing function
   DROP FUNCTION IF EXISTS function_name(parameter_type);
   
   -- Then create the new function with the updated parameter name
   CREATE OR REPLACE FUNCTION function_name(new_parameter_name parameter_type)
   ...
   ```

3. Pay attention to parameter naming consistency between different SQL files. For example, in `create_tables.sql` and `api_functions.sql`, ensure that function parameters use the same naming convention.

### Function Naming Conflicts Between Files

The SQL files `create_tables.sql` and `api_functions.sql` may have similar functions with different names or parameter structures:

1. In `create_tables.sql`, there's a function called `track_completed_workout`, but in `api_functions.sql`, there's a similar function named `record_completed_workout`.

2. Functions like `get_user_profile` and `get_workout_details` may have parameters named differently (`user_id` vs. `p_user_id`).

To handle these conflicts:

- The updated SQL files include `DROP FUNCTION IF EXISTS` statements to remove any existing functions before creating new ones.
- If running SQL scripts manually, use this order:
  1. Run `create_tables.sql` first to set up tables and initial functions
  2. Run `sample_data.sql` to populate sample data
  3. Run `api_functions.sql` last, which will drop and recreate any conflicting functions

This approach ensures that regardless of differences between the files, the final database will be consistent.

### SQL Error: "syntax error at or near FOR"

If you encounter this error:
```
ERROR: 42601: syntax error at or near "FOR"
LINE 815: OR t ILIKE ANY(ARRAY['%' || g || '%' FOR g IN v_goals])
```

This error occurs because the SQL uses array comprehension syntax (`ARRAY[... FOR ... IN ...]`), which is only available in PostgreSQL 12 and later versions. The updated SQL files now use a more compatible approach:

```sql
-- Instead of this (requires PostgreSQL 12+):
OR t ILIKE ANY(ARRAY['%' || g || '%' FOR g IN v_goals])

-- We now use this (compatible with older PostgreSQL versions):
OR EXISTS (
   SELECT 1 
   FROM unnest(v_goals) g 
   WHERE t ILIKE '%' || g || '%'
)
```

This alternative approach uses a subquery with `EXISTS` and `unnest()` to achieve the same functionality in a more compatible way.

### Other Common Issues

- If you encounter errors about missing extensions, ensure that the `uuid-ossp` and `pgcrypto` extensions are enabled
- If RLS policies are preventing access, verify that you're using the correct authentication
- Check that your API keys in `.env` have the necessary permissions

## Further Development

- For additional features, modify the schema and create new migrations
- Update API functions to support new functionality
- Add more complex triggers for advanced features like achievements

---

For more information, refer to the [Supabase documentation](https://supabase.com/docs) and [PostgreSQL documentation](https://www.postgresql.org/docs/). 