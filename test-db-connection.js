require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Try to query the database version (simple test query)
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      
      // Try a different approach - list tables
      console.log('Trying alternative approach - listing tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public')
        .limit(5);
      
      if (tablesError) {
        console.error('Failed to list tables:', tablesError.message);
        console.log('\nTrying direct SQL query...');
        
        const { data: sqlData, error: sqlError } = await supabase.from('_postgres_version').select('*').limit(1);
        
        if (sqlError) {
          console.error('Direct SQL query failed:', sqlError.message);
          console.log('\nRecommendation: Use the Supabase Dashboard SQL Editor to execute your scripts');
        } else {
          console.log('Direct SQL query successful:', sqlData);
        }
      } else {
        console.log('Successfully connected to Supabase!');
        console.log('Tables in public schema:', tables);
      }
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Database version:', data);
    }
    
    // Check if we have RPC functions
    const { data: functions, error: functionsError } = await supabase.rpc('list_functions');
    
    if (functionsError) {
      console.log('Could not list RPC functions:', functionsError.message);
    } else {
      console.log('Available RPC functions:', functions);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection(); 