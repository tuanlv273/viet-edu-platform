// src/lib/db/models/subject.ts
// Mô hình và các hàm thao tác với dữ liệu môn học

import { Subject } from '../schema';
import { execute, getOne, query } from '../client';

// Lấy tất cả môn học
export async function getAllSubjects(): Promise<Subject[]> {
  const sql = `
    SELECT * FROM subjects
    ORDER BY name
  `;
  
  return await query(sql);
}

// Lấy môn học theo ID
export async function getSubjectById(id: number): Promise<Subject | null> {
  const sql = `
    SELECT * FROM subjects
    WHERE id = ?
  `;
  
  return await getOne(sql, [id]);
}

// Tạo môn học mới
export async function createSubject(subject: Omit<Subject, 'id' | 'created_at'>): Promise<number> {
  const sql = `
    INSERT INTO subjects (
      name, description, icon_url
    ) VALUES (?, ?, ?)
  `;
  
  const result = await execute(sql, [
    subject.name,
    subject.description || null,
    subject.icon_url || null
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật thông tin môn học
export async function updateSubject(id: number, subject: Partial<Subject>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (subject.name) {
    fields.push('name = ?');
    values.push(subject.name);
  }
  
  if (subject.description !== undefined) {
    fields.push('description = ?');
    values.push(subject.description);
  }
  
  if (subject.icon_url !== undefined) {
    fields.push('icon_url = ?');
    values.push(subject.icon_url);
  }
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE subjects
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa môn học
export async function deleteSubject(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM subjects
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy môn học theo lớp
export async function getSubjectsByGrade(gradeId: number): Promise<Subject[]> {
  const sql = `
    SELECT DISTINCT s.* 
    FROM subjects s
    JOIN lessons l ON s.id = l.subject_id
    WHERE l.grade_id = ?
    ORDER BY s.name
  `;
  
  return await query(sql, [gradeId]);
}
