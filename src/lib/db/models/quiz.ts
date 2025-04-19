// src/lib/db/models/quiz.ts
// Mô hình và các hàm thao tác với dữ liệu bài kiểm tra

import { Quiz, QuizQuestion, QuizOption } from '../schema';
import { execute, getOne, query } from '../client';

// Lấy tất cả bài kiểm tra
export async function getAllQuizzes(): Promise<Quiz[]> {
  const sql = `
    SELECT * FROM quizzes
    ORDER BY subject_id, grade_id, title
  `;
  
  return await query(sql);
}

// Lấy bài kiểm tra theo ID
export async function getQuizById(id: number): Promise<Quiz | null> {
  const sql = `
    SELECT * FROM quizzes
    WHERE id = ?
  `;
  
  return await getOne(sql, [id]);
}

// Lấy bài kiểm tra theo môn học và lớp
export async function getQuizzesBySubjectAndGrade(subjectId: number, gradeId: number): Promise<Quiz[]> {
  const sql = `
    SELECT * FROM quizzes
    WHERE subject_id = ? AND grade_id = ?
    ORDER BY quiz_type, difficulty_level, title
  `;
  
  return await query(sql, [subjectId, gradeId]);
}

// Lấy bài kiểm tra theo bài học
export async function getQuizzesByLesson(lessonId: number): Promise<Quiz[]> {
  const sql = `
    SELECT * FROM quizzes
    WHERE lesson_id = ?
    ORDER BY quiz_type, difficulty_level, title
  `;
  
  return await query(sql, [lessonId]);
}

// Tạo bài kiểm tra mới
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const sql = `
    INSERT INTO quizzes (
      title, description, subject_id, grade_id, lesson_id,
      quiz_type, difficulty_level, time_limit, passing_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    quiz.title,
    quiz.description || null,
    quiz.subject_id,
    quiz.grade_id,
    quiz.lesson_id || null,
    quiz.quiz_type,
    quiz.difficulty_level,
    quiz.time_limit || null,
    quiz.passing_score
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật thông tin bài kiểm tra
export async function updateQuiz(id: number, quiz: Partial<Quiz>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (quiz.title) {
    fields.push('title = ?');
    values.push(quiz.title);
  }
  
  if (quiz.description !== undefined) {
    fields.push('description = ?');
    values.push(quiz.description);
  }
  
  if (quiz.subject_id) {
    fields.push('subject_id = ?');
    values.push(quiz.subject_id);
  }
  
  if (quiz.grade_id) {
    fields.push('grade_id = ?');
    values.push(quiz.grade_id);
  }
  
  if (quiz.lesson_id !== undefined) {
    fields.push('lesson_id = ?');
    values.push(quiz.lesson_id);
  }
  
  if (quiz.quiz_type) {
    fields.push('quiz_type = ?');
    values.push(quiz.quiz_type);
  }
  
  if (quiz.difficulty_level) {
    fields.push('difficulty_level = ?');
    values.push(quiz.difficulty_level);
  }
  
  if (quiz.time_limit !== undefined) {
    fields.push('time_limit = ?');
    values.push(quiz.time_limit);
  }
  
  if (quiz.passing_score !== undefined) {
    fields.push('passing_score = ?');
    values.push(quiz.passing_score);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE quizzes
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa bài kiểm tra
export async function deleteQuiz(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM quizzes
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy câu hỏi của bài kiểm tra
export async function getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
  const sql = `
    SELECT * FROM quiz_questions
    WHERE quiz_id = ?
    ORDER BY order_index
  `;
  
  return await query(sql, [quizId]);
}

// Thêm câu hỏi vào bài kiểm tra
export async function addQuizQuestion(question: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const sql = `
    INSERT INTO quiz_questions (
      quiz_id, question_text, question_type, points, explanation, order_index
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    question.quiz_id,
    question.question_text,
    question.question_type,
    question.points,
    question.explanation || null,
    question.order_index
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật câu hỏi
export async function updateQuizQuestion(id: number, question: Partial<QuizQuestion>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (question.question_text) {
    fields.push('question_text = ?');
    values.push(question.question_text);
  }
  
  if (question.question_type) {
    fields.push('question_type = ?');
    values.push(question.question_type);
  }
  
  if (question.points !== undefined) {
    fields.push('points = ?');
    values.push(question.points);
  }
  
  if (question.explanation !== undefined) {
    fields.push('explanation = ?');
    values.push(question.explanation);
  }
  
  if (question.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(question.order_index);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE quiz_questions
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa câu hỏi
export async function deleteQuizQuestion(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM quiz_questions
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}

// Lấy các lựa chọn của câu hỏi
export async function getQuizOptions(questionId: number): Promise<QuizOption[]> {
  const sql = `
    SELECT * FROM quiz_options
    WHERE question_id = ?
    ORDER BY order_index
  `;
  
  return await query(sql, [questionId]);
}

// Thêm lựa chọn cho câu hỏi
export async function addQuizOption(option: Omit<QuizOption, 'id' | 'created_at'>): Promise<number> {
  const sql = `
    INSERT INTO quiz_options (
      question_id, option_text, is_correct, order_index
    ) VALUES (?, ?, ?, ?)
  `;
  
  const result = await execute(sql, [
    option.question_id,
    option.option_text,
    option.is_correct,
    option.order_index
  ]);
  
  return result.meta.last_row_id;
}

// Cập nhật lựa chọn
export async function updateQuizOption(id: number, option: Partial<QuizOption>): Promise<boolean> {
  // Tạo câu lệnh SQL động dựa trên các trường cần cập nhật
  const fields: string[] = [];
  const values: any[] = [];
  
  if (option.option_text) {
    fields.push('option_text = ?');
    values.push(option.option_text);
  }
  
  if (option.is_correct !== undefined) {
    fields.push('is_correct = ?');
    values.push(option.is_correct);
  }
  
  if (option.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(option.order_index);
  }
  
  if (fields.length === 0) {
    return false;
  }
  
  const sql = `
    UPDATE quiz_options
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  
  values.push(id);
  
  const result = await execute(sql, values);
  return result.meta.changes > 0;
}

// Xóa lựa chọn
export async function deleteQuizOption(id: number): Promise<boolean> {
  const sql = `
    DELETE FROM quiz_options
    WHERE id = ?
  `;
  
  const result = await execute(sql, [id]);
  return result.meta.changes > 0;
}
