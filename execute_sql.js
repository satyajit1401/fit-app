require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(filePath, fileName) {
  try {
    console.log(`Reading SQL file: ${fileName}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Executing ${fileName}...`);
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error(`Error executing ${fileName}:`, error);
      return false;
    }
    
    console.log(`Successfully executed ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error processing ${fileName}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting SQL execution process...');
  
  // Execute create_tables.sql first
  const createTablesSuccess = await executeSQL('./create_tables.sql', 'create_tables.sql');
  
  if (createTablesSuccess) {
    // Next, execute sample_data.sql
    const sampleDataSuccess = await executeSQL('./sample_data.sql', 'sample_data.sql');
    
    // Finally, execute api_functions.sql
    if (sampleDataSuccess) {
      await executeSQL('./api_functions.sql', 'api_functions.sql');
    }
  }
  
  console.log('SQL execution process completed');
}

main().catch(err => {
  console.error('Failed to execute SQL:', err);
  process.exit(1);
}); 