// src/lib/db/models/test-connection.ts
// Test file to verify MySQL connection

import { getDbClient, closeConnection } from '../client';

/**
 * Test MySQL connection
 * This function attempts to connect to the MySQL database and run a simple query
 */
export async function testMySQLConnection() {
  try {
    const db = await getDbClient();
    console.log('Successfully connected to MySQL database');
    
    // Run a simple query to test the connection
    const [rows] = await db.query('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    // Close the connection
    await closeConnection();
    console.log('Connection closed successfully');
    
    return { success: true, message: 'MySQL connection test successful' };
  } catch (error) {
    console.error('MySQL connection test failed:', error);
    return { 
      success: false, 
      message: 'MySQL connection test failed', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
