// scripts/migrate.js
// Script to run MySQL migrations

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Starting database migration...');
  
  // Create MySQL connection
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true // Enable multiple SQL statements
  });
  
  try {
    // Create database if it doesn't exist
    const dbName = process.env.MYSQL_DATABASE || 'viet_edu';
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Use the database
    console.log(`Using database ${dbName}...`);
    await connection.query(`USE ${dbName}`);
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/0001_initial.sql');
    console.log(`Reading migration file: ${migrationPath}`);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    console.log('Executing migration...');
    await connection.query(migrationSQL);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the migration
runMigration();
