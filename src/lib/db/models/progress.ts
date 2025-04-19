// src/lib/db/models/progress.ts
// Mô hình và các hàm thao tác với dữ liệu tiến trình học tập

import { UserProgress, UserQuizResult, LearningPath, LearningPathItem } from '../schema';
import { execute, getOne, query } from '../client';

// Lấy tiến trình học tập của người dùng
export async function getUserProgress(userId: number): Promise<UserProgress[]> {
  const sql = `
    SELECT * FROM user_progress
    WHERE user_id = ?
    ORDER BY last_accessed_at DESC
  `;
  
  return await query(sql, [userId]);
}

// Lấy tiến trình học tập của người dùng theo bài học
export async function getUserLessonProgress(userId: number, lessonId: number): Promise<UserProgress | null> {
  const sql = `
    SELECT * FROM user_progress
    WHERE user_id = ? AND lesson_id = ?
  `;
  
  return await getOne(sql, [userId, lessonId]);
}

// Tạo hoặc cập nhật tiến trình học tập
export async function updateUserProgress(progress: Omit<UserProgress, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  // Kiểm tra xem tiến trình đã tồn tại chưa
  const existingProgress = await getUserLessonProgress(progress.user_id, progress.lesson_id);
  
  if (existingProgress) {
    // Cập nhật tiến trình hiện có
    const sql = `
      UPDATE user_progress
      SET status = ?, progress_percentage = ?, last_accessed_at = CURRENT_TIMESTAMP,
          completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await execute(sql, [
      progress.status,
      progress.progress_percentage,
      progress.completed_at || null,
      existingProgress.id
    ]);
    
    return existingProgress.id;
  } else {
    // Tạo tiến trình mới
    const sql = `
      INSERT INTO user_progress (
        user_id, lesson_id, status, progress_percentage,
        last_accessed_at, completed_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `;
    
    const result = await execute(sql, [
      progress.user_id,
      progress.lesson_id,
      progress.status,
      progress.progress_percentage,
      progress.completed_at || null
    ]);
    
    return result.meta.last_row_id;
  }
}

// Lấy kết quả kiểm tra của người dùng
export async function getUserQuizResults(userId: number): Promise<UserQuizResult[]> {
  const sql = `
    SELECT * FROM user_quiz_results
    WHERE user_id = ?
    ORDER BY completed_at DESC
  `;
  
  return await query(sql, [userId]);
}

// Lấy kết quả kiểm tra của người dùng theo bài kiểm tra
export async function getUserQuizResult(userId: number, quizId: number): Promise<UserQuizResult | null> {
  const sql = `
    SELECT * FROM user_quiz_results
    WHERE user_id = ? AND quiz_id = ?
    ORDER BY completed_at DESC
    LIMIT 1
  `;
  
  return await getOne(sql, [userId, quizId]);
}

// Lưu kết quả kiểm tra
export async function saveQuizResult(result: Omit<UserQuizResult, 'id' | 'created_at'>): Promise<number> {
  const sql = `
    INSERT INTO user_quiz_results (
      user_id, quiz_id, score, total_questions, correct_answers,
      time_spent, passed, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const resultDb = await execute(sql, [
    result.user_id,
    result.quiz_id,
    result.score,
    result.total_questions,
    result.correct_answers,
    result.time_spent || null,
    result.passed,
    result.started_at,
    result.completed_at
  ]);
  
  return resultDb.meta.last_row_id;
}

// Lấy lộ trình học tập của người dùng
export async function getUserLearningPaths(userId: number): Promise<LearningPath[]> {
  const sql = `
    SELECT * FROM learning_paths
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `;
  
  return await query(sql, [userId]);
}

// Lấy lộ trình học tập theo ID
export async function getLearningPathById(id: number): Promise<LearningPath | null> {
  const sql = `
    SELECT * FROM learning_paths
    WHERE id = ?
  `;
  
  return await getOne(sql, [id]);
}

// Tạo lộ trình học tập mới
export async function createLearningPath(path: Omit<LearningPath, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const sql = `
    INSERT INTO learning_paths (
      user_id, title, description, is_system_generated
    ) VALUES (?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    path.user_id,
    path.title,
    path.description || null,
    path.is_system_generated
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật lộ trình học tập
export async function updateLearningPath(id: number, path: Partial<LearningPath>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (path.title) {
    fields.push('title = ?');
    values.push(path.title);
  }
  
  if (path.description !== undefined) {
    fields.push('description = ?');
    values.push(path.description);
  }
  
  if (path.is_system_generated !== undefined) {
    fields.push('is_system_generated = ?');
    values.push(path.is_system_generated);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE learning_paths
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa lộ trình học tập
export async function deleteLearningPath(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM learning_paths
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy các mục trong lộ trình học tập
export async function getLearningPathItems(pathId: number): Promise<LearningPathItem[]> {
  const sql = `
    SELECT * FROM learning_path_items
    WHERE learning_path_id = ?
    ORDER BY order_index
  `;
  
  return await query(sql, [pathId]);
}

// Thêm mục vào lộ trình học tập
export async function addLearningPathItem(item: Omit<LearningPathItem, 'id' | 'created_at'>): Promise<number> {
  const sql = `
    INSERT INTO learning_path_items (
      learning_path_id, lesson_id, quiz_id, order_index
    ) VALUES (?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    item.learning_path_id,
    item.lesson_id || null,
    item.quiz_id || null,
    item.order_index
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật mục trong lộ trình học tập
export async function updateLearningPathItem(id: number, item: Partial<LearningPathItem>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (item.lesson_id !== undefined) {
    fields.push('lesson_id = ?');
    values.push(item.lesson_id);
  }
  
  if (item.quiz_id !== undefined) {
    fields.push('quiz_id = ?');
    values.push(item.quiz_id);
  }
  
  if (item.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(item.order_index);
  }
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE learning_path_items
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa mục trong lộ trình học tập
export async function deleteLearningPathItem(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM learning_path_items
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy thống kê tiến trình học tập của người dùng
export async function getUserProgressStatistics(userId: number): Promise<any> {
  // Thống kê tiến trình bài học
  const lessonProgressSql = `
    SELECT 
      COUNT(*) as total_lessons,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_lessons,
      AVG(progress_percentage) as average_progress
    FROM user_progress
    WHERE user_id = ?
  `;
  
  const lessonProgress = await getOne(lessonProgressSql, [userId]);
  
  // Thống kê kết quả kiểm tra
  const quizResultsSql = `
    SELECT 
      COUNT(*) as total_quizzes,
      SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_quizzes,
      AVG(score) as average_score
    FROM user_quiz_results
    WHERE user_id = ?
  `;
  
  const quizResults = await getOne(quizResultsSql, [userId]);
  
  return {
    lessonProgress,
    quizResults
  };
}
