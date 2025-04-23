// src/lib/db/client.ts
// Kết nối và thao tác với cơ sở dữ liệu MySQL

import mysql from 'mysql2/promise';

// Cấu hình kết nối MySQL
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'viet_edu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool kết nối để tái sử dụng
let pool: mysql.Pool | null = null;

// Hàm lấy pool kết nối
export async function getDbClient() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('MySQL connection pool created');
    } catch (error) {
      console.error('Error creating MySQL connection pool:', error);
      throw error;
    }
  }
  return pool;
}

// Hàm truy vấn cơ sở dữ liệu
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDbClient();
  
  try {
    const [rows] = await db.query(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Hàm lấy một bản ghi
export async function getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const db = await getDbClient();
  
  try {
    const [rows] = await db.query(sql, params);
    const results = rows as T[];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Interface cho kết quả thực thi câu lệnh
export interface ExecuteResult {
  success: boolean;
  meta: {
    changes: number;
    last_row_id: number;
  };
}

// Hàm thực thi câu lệnh (insert, update, delete)
export async function execute(sql: string, params: any[] = []): Promise<ExecuteResult> {
  const db = await getDbClient();
  
  try {
    const [result] = await db.query(sql, params);
    // Chuyển đổi kết quả MySQL sang định dạng tương thích
    return {
      success: true,
      meta: {
        changes: (result as mysql.ResultSetHeader).affectedRows,
        last_row_id: (result as mysql.ResultSetHeader).insertId
      }
    };
  } catch (error) {
    console.error('Database execution error:', error);
    throw error;
  }
}

// Hàm đóng kết nối
export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL connection pool closed');
  }
}
