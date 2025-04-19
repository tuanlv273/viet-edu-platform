// src/lib/db/schema.ts
// Định nghĩa schema cho cơ sở dữ liệu

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  grade_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  created_at: string;
}

export interface Grade {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Subject {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
  created_at: string;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface LessonContent {
  id: number;
  lesson_id: number;
  content_type: 'text' | 'image' | 'video' | 'interactive';
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  lesson_id?: number;
  quiz_type: 'practice' | 'midterm' | 'final';
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  time_limit?: number;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'matching';
  points: number;
  explanation?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  last_accessed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserQuizResult {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent?: number;
  passed: boolean;
  started_at: string;
  completed_at: string;
  created_at: string;
}

export interface LearningPath {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  is_system_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningPathItem {
  id: number;
  learning_path_id: number;
  lesson_id?: number;
  quiz_id?: number;
  order_index: number;
  created_at: string;
}
