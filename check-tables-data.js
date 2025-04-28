require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTablesData() {
  console.log('Checking for actual data in tables...');
  
  const tables = [
    'users',
    'workouts',
    'exercises',
    'workout_exercises',
    'progress',
    'workout_sessions'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\nChecking table: ${table}`);
      
      // Try to get a few records
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(3);
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error.message);
      } else if (!data || data.length === 0) {
        console.log(`ℹ️ Table ${table} exists but has no data`);
      } else {
        console.log(`✅ Table ${table} exists with ${data.length} records`);
        console.log('Sample record:', JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      }
    } catch (err) {
      console.error(`Error checking ${table}:`, err);
    }
  }
  
  // Try running a manual query to check for API functions
  try {
    console.log('\nChecking authentication API call...');
    const { data, error } = await supabase.rpc(
      'authenticate_user',
      { p_email: 'john@example.com', p_password: 'password123' }
    );
    
    if (error) {
      console.error('❌ Error with authenticate_user function:', error.message);
    } else {
      console.log('✅ authenticate_user function exists and returned:', data);
    }
  } catch (err) {
    console.error('Error checking authentication function:', err);
  }
}

checkTablesData(); 