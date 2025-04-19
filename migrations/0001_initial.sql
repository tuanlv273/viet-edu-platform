-- Migration number: 0001 	 2025-04-19T04:17:44.000Z
-- Xóa bảng nếu đã tồn tại
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS lesson_contents;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quiz_options;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS user_quiz_results;
DROP TABLE IF EXISTS learning_paths;

-- Bảng vai trò người dùng
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  grade_id INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id) REFERENCES grades(id)
);

-- Bảng liên kết người dùng và vai trò
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Bảng lớp học
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng môn học
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bài học
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  subject_id INTEGER NOT NULL,
  grade_id INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL, -- 'basic', 'intermediate', 'advanced'
  order_index INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE
);

-- Bảng nội dung bài học
CREATE TABLE IF NOT EXISTS lesson_contents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  content_type TEXT NOT NULL, -- 'text', 'image', 'video', 'interactive'
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Bảng bài kiểm tra
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  subject_id INTEGER NOT NULL,
  grade_id INTEGER NOT NULL,
  lesson_id INTEGER,
  quiz_type TEXT NOT NULL, -- 'practice', 'midterm', 'final'
  difficulty_level TEXT NOT NULL, -- 'basic', 'intermediate', 'advanced'
  time_limit INTEGER, -- thời gian làm bài tính bằng phút
  passing_score INTEGER NOT NULL, -- điểm đạt
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
);

-- Bảng câu hỏi kiểm tra
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'multiple_choice', 'true_false', 'matching'
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Bảng lựa chọn câu hỏi
CREATE TABLE IF NOT EXISTS quiz_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Bảng tiến trình học tập của người dùng
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'not_started', 'in_progress', 'completed'
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  last_accessed_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE(user_id, lesson_id)
);

-- Bảng kết quả kiểm tra của người dùng
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER, -- thời gian làm bài tính bằng giây
  passed BOOLEAN NOT NULL,
  started_at DATETIME NOT NULL,
  completed_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Bảng lộ trình học tập
CREATE TABLE IF NOT EXISTS learning_paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng chi tiết lộ trình học tập
CREATE TABLE IF NOT EXISTS learning_path_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  learning_path_id INTEGER NOT NULL,
  lesson_id INTEGER,
  quiz_id INTEGER,
  order_index INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
  CHECK ((lesson_id IS NULL AND quiz_id IS NOT NULL) OR (lesson_id IS NOT NULL AND quiz_id IS NULL))
);

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
