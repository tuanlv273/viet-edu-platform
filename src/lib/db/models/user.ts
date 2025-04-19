// src/lib/db/models/user.ts
// Mô hình và các hàm thao tác với dữ liệu người dùng

import { User, UserRole } from '../schema';
import { execute, getOne, query } from '../client';

// Lấy người dùng theo ID
export async function getUserById(id: number): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE id = ?
  `;
  
  return await getOne(sql, [id]);
}

// Lấy người dùng theo email
export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE email = ?
  `;
  
  return await getOne(sql, [email]);
}

// Lấy người dùng theo username
export async function getUserByUsername(username: string): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE username = ?
  `;
  
  return await getOne(sql, [username]);
}

// Tạo người dùng mới
export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const sql = `
    INSERT INTO users (
      username, email, password_hash, full_name, 
      avatar_url, grade_id, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    user.username,
    user.email,
    user.password_hash,
    user.full_name,
    user.avatar_url || null,
    user.grade_id || null,
    user.is_active
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật thông tin người dùng
export async function updateUser(id: number, user: Partial<User>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (user.username) {
    fields.push('username = ?');
    values.push(user.username);
  }
  
  if (user.email) {
    fields.push('email = ?');
    values.push(user.email);
  }
  
  if (user.password_hash) {
    fields.push('password_hash = ?');
    values.push(user.password_hash);
  }
  
  if (user.full_name) {
    fields.push('full_name = ?');
    values.push(user.full_name);
  }
  
  if (user.avatar_url !== undefined) {
    fields.push('avatar_url = ?');
    values.push(user.avatar_url);
  }
  
  if (user.grade_id !== undefined) {
    fields.push('grade_id = ?');
    values.push(user.grade_id);
  }
  
  if (user.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(user.is_active);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa người dùng
export async function deleteUser(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM users
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy vai trò của người dùng
export async function getUserRoles(userId: number): Promise<UserRole[]> {
  const sql = `
    SELECT ur.* FROM user_roles ur
    WHERE ur.user_id = ?
  `;
  
  return await query(sql, [userId]);
}

// Gán vai trò cho người dùng
export async function assignRoleToUser(userId: number, roleId: number): Promise<boolean> {
  const sql = `
    INSERT INTO user_roles (user_id, role_id)
    VALUES (?, ?)
    ON CONFLICT (user_id, role_id) DO NOTHING
  `;
  
  const result = await execute(sql, [userId, roleId]);
  return result.meta.changes > 0;
}

// Xóa vai trò của người dùng
export async function removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
  const sql = `
    DELETE FROM user_roles
    WHERE user_id = ? AND role_id = ?
  `;
  
  const result = await execute(sql, [userId, roleId]);
  return result.meta.changes > 0;
}

// Kiểm tra người dùng có vai trò cụ thể không
export async function userHasRole(userId: number, roleName: string): Promise<boolean> {
  const sql = `
    SELECT COUNT(*) as count
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ? AND r.name = ?
  `;
  
  const result = await getOne(sql, [userId, roleName]);
  return result && result.count > 0;
}
