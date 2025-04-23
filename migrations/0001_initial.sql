-- Migration number: 0001 	 2025-04-22
-- MySQL compatible migration script for VietEdu Platform

-- Xóa bảng nếu đã tồn tại
DROP TABLE IF EXISTS learning_path_items;
DROP TABLE IF EXISTS learning_paths;
DROP TABLE IF EXISTS user_quiz_results;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS quiz_options;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS lesson_contents;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Bảng vai trò người dùng
CREATE TABLE IF NOT EXISTS roles (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lớp học
CREATE TABLE IF NOT EXISTS grades (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255),
  grade_id INT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (grade_id) REFERENCES grades(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng liên kết người dùng và vai trò
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng môn học
CREATE TABLE IF NOT EXISTS subjects (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng bài học
CREATE TABLE IF NOT EXISTS lessons (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INT NOT NULL,
  grade_id INT NOT NULL,
  difficulty_level ENUM('basic', 'intermediate', 'advanced') NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng nội dung bài học
CREATE TABLE IF NOT EXISTS lesson_contents (
  id INT NOT NULL AUTO_INCREMENT,
  lesson_id INT NOT NULL,
  content_type ENUM('text', 'image', 'video', 'interactive') NOT NULL,
  content TEXT NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng bài kiểm tra
CREATE TABLE IF NOT EXISTS quizzes (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INT NOT NULL,
  grade_id INT NOT NULL,
  lesson_id INT,
  quiz_type ENUM('practice', 'midterm', 'final') NOT NULL,
  difficulty_level ENUM('basic', 'intermediate', 'advanced') NOT NULL,
  time_limit INT, -- thời gian làm bài tính bằng phút
  passing_score INT NOT NULL, -- điểm đạt
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng câu hỏi kiểm tra
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT NOT NULL AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'matching') NOT NULL,
  points INT NOT NULL DEFAULT 1,
  explanation TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lựa chọn câu hỏi
CREATE TABLE IF NOT EXISTS quiz_options (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  order_index INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng tiến trình học tập của người dùng
CREATE TABLE IF NOT EXISTS user_progress (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL,
  progress_percentage INT NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_lesson (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng kết quả kiểm tra của người dùng
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  time_spent INT, -- thời gian làm bài tính bằng giây
  passed TINYINT(1) NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lộ trình học tập
CREATE TABLE IF NOT EXISTS learning_paths (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_system_generated TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chi tiết lộ trình học tập
CREATE TABLE IF NOT EXISTS learning_path_items (
  id INT NOT NULL AUTO_INCREMENT,
  learning_path_id INT NOT NULL,
  lesson_id INT,
  quiz_id INT,
  order_index INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
  CHECK ((lesson_id IS NULL AND quiz_id IS NOT NULL) OR (lesson_id IS NOT NULL AND quiz_id IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu cho vai trò
INSERT INTO roles (name, description) VALUES 
  ('admin', 'Quản trị viên hệ thống'),
  ('teacher', 'Giáo viên'),
  ('student', 'Học sinh');

-- Dữ liệu mẫu cho lớp học
INSERT INTO grades (name, description) VALUES 
  ('Lớp 1', 'Lớp 1 - Cấp tiểu học'),
  ('Lớp 2', 'Lớp 2 - Cấp tiểu học'),
  ('Lớp 3', 'Lớp 3 - Cấp tiểu học'),
  ('Lớp 4', 'Lớp 4 - Cấp tiểu học'),
  ('Lớp 5', 'Lớp 5 - Cấp tiểu học'),
  ('Lớp 6', 'Lớp 6 - Cấp trung học cơ sở'),
  ('Lớp 7', 'Lớp 7 - Cấp trung học cơ sở'),
  ('Lớp 8', 'Lớp 8 - Cấp trung học cơ sở'),
  ('Lớp 9', 'Lớp 9 - Cấp trung học cơ sở');

-- Dữ liệu mẫu cho môn học
INSERT INTO subjects (name, description, icon_url) VALUES 
  ('Toán', 'Môn Toán học', '/icons/math.svg'),
  ('Tiếng Anh', 'Môn Tiếng Anh', '/icons/english.svg'),
  ('Vật lý', 'Môn Vật lý', '/icons/physics.svg'),
  ('Hóa học', 'Môn Hóa học', '/icons/chemistry.svg'),
  ('Tin học', 'Môn Tin học', '/icons/informatics.svg');

-- Tạo các chỉ mục để tối ưu truy vấn
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_lessons_subject_grade ON lessons(subject_id, grade_id);
CREATE INDEX idx_quizzes_subject_grade ON quizzes(subject_id, grade_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_quiz_results_user ON user_quiz_results(user_id);
CREATE INDEX idx_learning_paths_user ON learning_paths(user_id);
