// Supabase client setup with full database access
require('dotenv').config();
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with full access
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to execute SQL directly via REST API
async function executeSql(query) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pgcall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query
      })
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(JSON.stringify(errorBody));
    }

    return { success: true, message: 'SQL executed successfully' };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { success: false, error: error.message };
  }
}

// Utility functions for database operations

// Example: Create a table
async function createTable(tableName, tableDefinition) {
  try {
    // Create the table using SQL
    const query = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${tableDefinition}
      );
    `;
    
    const result = await executeSql(query);
    
    if (!result.success) throw new Error(result.error);
    
    console.log(`Table ${tableName} created successfully`);
    return { success: true, message: `Table ${tableName} created successfully` };
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    return { success: false, error: error.message };
  }
}

// Helper function to parse a SQL-like table definition into a schema object
// This is a simple parser for basic definitions
function parseTableDefinition(definition) {
  const schema = {};
  const columns = definition.split(',').map(col => col.trim());
  
  columns.forEach(column => {
    const parts = column.split(' ');
    const name = parts[0];
    const type = parts[1].toLowerCase();
    
    schema[name] = { type: mapType(type) };
    
    // Check for constraints
    if (column.includes('PRIMARY KEY')) {
      schema[name].primaryKey = true;
    }
    
    if (column.includes('NOT NULL')) {
      schema[name].notNull = true;
    }
    
    if (column.includes('UNIQUE')) {
      schema[name].unique = true;
    }
    
    if (column.includes('DEFAULT')) {
      const defaultMatch = column.match(/DEFAULT\s+(.*?)(\s|$)/i);
      if (defaultMatch) {
        if (defaultMatch[1] === 'uuid_generate_v4()') {
          schema[name].defaultValue = { type: 'function', value: 'uuid_generate_v4()' };
        } else if (defaultMatch[1] === 'NOW()') {
          schema[name].defaultValue = { type: 'function', value: 'now()' };
        } else {
          schema[name].defaultValue = defaultMatch[1];
        }
      }
    }
  });
  
  return schema;
}

// Map SQL types to Supabase types
function mapType(sqlType) {
  const typeMap = {
    'uuid': 'uuid',
    'text': 'text',
    'integer': 'integer',
    'numeric': 'numeric',
    'timestamp': 'timestamp',
    'boolean': 'boolean',
    'jsonb': 'jsonb',
    'json': 'json',
    'timestamp with time zone': 'timestamp with time zone'
  };
  
  // Try direct mapping first
  if (typeMap[sqlType]) {
    return typeMap[sqlType];
  }
  
  // Handle more complex types
  if (sqlType.startsWith('varchar')) {
    return 'text';
  }
  
  if (sqlType.startsWith('int')) {
    return 'integer';
  }
  
  // Default to text for unknown types
  return 'text';
}

// Example: Insert data into a table
async function insertData(tableName, data) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) throw error;
    console.log(`Data inserted into ${tableName} successfully`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error inserting data into ${tableName}:`, error);
    return { success: false, error: error.message };
  }
}

// Example: Query data from a table
async function queryData(tableName, query = {}) {
  try {
    let request = supabase.from(tableName).select('*');
    
    // Apply filters if provided
    if (query.filters) {
      Object.entries(query.filters).forEach(([column, value]) => {
        request = request.eq(column, value);
      });
    }
    
    const { data, error } = await request;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Error querying data from ${tableName}:`, error);
    return { success: false, error: error.message };
  }
}

// Export the Supabase client and utility functions
module.exports = {
  supabase,
  createTable,
  insertData,
  queryData,
  executeSql
};

// Example usage (uncomment to run)
/*
(async () => {
  // Example: Create a users table
  await createTable('users', `
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  `);
  
  // Example: Insert a user
  await insertData('users', {
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  // Example: Query users
  const result = await queryData('users');
  console.log(result.data);
})();
*/ 