require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRPCFunction() {
  try {
    console.log('Setting up RPC function in Supabase...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./create_rpc.sql', 'utf8');
    
    // Execute the SQL directly using the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error creating RPC function:', result);
      return false;
    }
    
    console.log('Successfully created RPC function');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

createRPCFunction().catch(err => {
  console.error('Failed to create RPC function:', err);
  process.exit(1);
}); 