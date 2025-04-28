require('dotenv').config();
const fetch = require('node-fetch');

const accessToken = 'sbp_d5a3832dd517dd79a576f3e3d8e01b255b3266cf';
const projectRef = 'ndslsadsumxhvnpbkvui';

async function checkProject() {
  console.log('Checking Supabase project details...');
  
  try {
    // Get project details
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      const errorData = await response.text();
      console.error('Details:', errorData);
      return;
    }
    
    const projectData = await response.json();
    console.log('Project Details:');
    console.log(`Name: ${projectData.name}`);
    console.log(`Region: ${projectData.region}`);
    console.log(`Database Status: ${projectData.status}`);
    console.log(`Created At: ${new Date(projectData.created_at).toLocaleString()}`);
    
    // Get database connection details
    const connectionResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/connection-string`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!connectionResponse.ok) {
      console.error(`Error getting connection details: ${connectionResponse.status}`);
    } else {
      const connectionData = await connectionResponse.json();
      console.log('\nDatabase Connection:');
      console.log(`Host: ${connectionData.db_host}`);
      console.log(`Port: ${connectionData.db_port}`);
      console.log(`Database Name: ${connectionData.db_name}`);
      console.log(`Database User: ${connectionData.db_user}`);
    }
    
    // Try getting SQL query history
    const sqlHistoryResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql-queries?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!sqlHistoryResponse.ok) {
      console.error(`Error getting SQL history: ${sqlHistoryResponse.status}`);
    } else {
      const sqlHistory = await sqlHistoryResponse.json();
      console.log('\nRecent SQL Queries:');
      if (sqlHistory.length === 0) {
        console.log('No recent SQL queries found.');
        console.log('This likely means the database setup scripts have not been executed yet.');
        console.log('Please follow the instructions in EXECUTE_IN_SUPABASE_DASHBOARD.md');
      } else {
        sqlHistory.forEach((query, index) => {
          console.log(`\nQuery ${index + 1}:`);
          console.log(`- Time: ${new Date(query.executed_at).toLocaleString()}`);
          console.log(`- Status: ${query.status}`);
          console.log(`- SQL: ${query.sql.substring(0, 100)}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking Supabase project:', error);
  }
}

checkProject(); 