// src/lib/db/models/lesson.ts
// Mô hình và các hàm thao tác với dữ liệu bài học

import { Lesson, LessonContent } from '../schema';
import { execute, getOne, query } from '../client';

// Lấy tất cả bài học
export async function getAllLessons(): Promise<Lesson[]> {
  const sql = `
    SELECT * FROM lessons
    ORDER BY subject_id, grade_id, order_index
  `;
  
  return await query(sql);
}

// Lấy bài học theo ID
export async function getLessonById(id: number): Promise<Lesson | null> {
  const sql = `
    SELECT * FROM lessons
    WHERE id = ?
  `;
  
  return await getOne(sql, [id]);
}

// Lấy bài học theo môn học và lớp
export async function getLessonsBySubjectAndGrade(subjectId: number, gradeId: number): Promise<Lesson[]> {
  const sql = `
    SELECT * FROM lessons
    WHERE subject_id = ? AND grade_id = ?
    ORDER BY order_index
  `;
  
  return await query(sql, [subjectId, gradeId]);
}

// Tạo bài học mới
export async function createLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const sql = `
    INSERT INTO lessons (
      title, description, subject_id, grade_id, 
      difficulty_level, order_index
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    lesson.title,
    lesson.description || null,
    lesson.subject_id,
    lesson.grade_id,
    lesson.difficulty_level,
    lesson.order_index
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật thông tin bài học
export async function updateLesson(id: number, lesson: Partial<Lesson>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (lesson.title) {
    fields.push('title = ?');
    values.push(lesson.title);
  }
  
  if (lesson.description !== undefined) {
    fields.push('description = ?');
    values.push(lesson.description);
  }
  
  if (lesson.subject_id) {
    fields.push('subject_id = ?');
    values.push(lesson.subject_id);
  }
  
  if (lesson.grade_id) {
    fields.push('grade_id = ?');
    values.push(lesson.grade_id);
  }
  
  if (lesson.difficulty_level) {
    fields.push('difficulty_level = ?');
    values.push(lesson.difficulty_level);
  }
  
  if (lesson.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(lesson.order_index);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE lessons
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa bài học
export async function deleteLesson(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM lessons
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy nội dung bài học
export async function getLessonContents(lessonId: number): Promise<LessonContent[]> {
  const sql = `
    SELECT * FROM lesson_contents
    WHERE lesson_id = ?
    ORDER BY order_index
  `;
  
  return await query(sql, [lessonId]);
}

// Thêm nội dung bài học
export async function addLessonContent(content: Omit<LessonContent, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const sql = `
    INSERT INTO lesson_contents (
      lesson_id, content_type, content, order_index
    ) VALUES (?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    content.lesson_id,
    content.content_type,
    content.content,
    content.order_index
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật nội dung bài học
export async function updateLessonContent(id: number, content: Partial<LessonContent>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (content.content_type) {
    fields.push('content_type = ?');
    values.push(content.content_type);
  }
  
  if (content.content) {
    fields.push('content = ?');
    values.push(content.content);
  }
  
  if (content.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(content.order_index);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE lesson_contents
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa nội dung bài học
export async function deleteLessonContent(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM lesson_contents
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}
