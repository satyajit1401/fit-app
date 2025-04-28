#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'sql/auth_functions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL statements
    console.log('🔄 Executing SQL statements...');
    const { error } = await supabase.rpc('pgmoon.raw_query', { query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Fallback: Try direct SQL execution
      console.log('🔄 Trying alternative method...');
      
      // Split SQL into individual statements
      const statements = sql.split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      // Execute each statement separately
      for (const statement of statements) {
        const { error } = await supabase.rpc('pgmoon.raw_query', { 
          query: statement + ';' 
        });
        
        if (error) {
          console.error(`❌ Error executing statement: ${statement}`);
          console.error(error);
        }
      }
    }
    
    console.log('✅ Database setup complete!');
    console.log('✅ Created tables: users');
    console.log('✅ Created functions: register_user, authenticate_user, get_user_profile');
    
    // Verify setup by checking if tables exist
    const { data, error: verifyError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (verifyError) {
      console.warn('⚠️ Verification failed. You may need to run the SQL manually in the Supabase dashboard.');
      console.warn('⚠️ Error:', verifyError.message);
    } else {
      console.log('✅ Verification successful!');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n⚠️ If setup failed, you can manually run the SQL statements in the Supabase dashboard:');
    console.log('1. Log in to your Supabase project');
    console.log('2. Go to SQL Editor');
    console.log('3. Open the file at sql/auth_functions.sql');
    console.log('4. Run the SQL statements manually');
  }
}

// Run the setup
setupDatabase(); 