// src/lib/db/client.ts
// Kết nối và thao tác với cơ sở dữ liệu D1

import { getCloudflareContext } from '../utils/cloudflare';

export async function getDbClient() {
  const { env } = getCloudflareContext();
  
  // Kiểm tra xem DB có được cấu hình không
  if (!env.DB) {
    console.warn('Database is not configured. Using fallback storage.');
    return null;
  }
  
  return env.DB;
}

// Hàm truy vấn cơ sở dữ liệu
export async function query(sql: string, params: any[] = []) {
  const db = await getDbClient();
  
  if (!db) {
    throw new Error('Database is not configured');
  }
  
  try {
    const result = await db.prepare(sql).bind(...params).all();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Hàm lấy một bản ghi
export async function getOne(sql: string, params: any[] = []) {
  const db = await getDbClient();
  
  if (!db) {
    throw new Error('Database is not configured');
  }
  
  try {
    const result = await db.prepare(sql).bind(...params).first();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Hàm thực thi câu lệnh (insert, update, delete)
export async function execute(sql: string, params: any[] = []) {
  const db = await getDbClient();
  
  if (!db) {
    throw new Error('Database is not configured');
  }
  
  try {
    const result = await db.prepare(sql).bind(...params).run();
    return result;
  } catch (error) {
    console.error('Database execution error:', error);
    throw error;
  }
}
