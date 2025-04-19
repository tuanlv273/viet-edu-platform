# Tài liệu kỹ thuật VietEdu

## Tổng quan hệ thống

VietEdu là nền tảng học tập trực tuyến dành cho học sinh từ lớp 1-9 theo chương trình giáo dục Việt Nam, được xây dựng bằng công nghệ Next.js và sử dụng cơ sở dữ liệu D1 của Cloudflare. Hệ thống cung cấp các bài học, bài kiểm tra, theo dõi tiến trình học tập, và đề xuất lộ trình học tập cá nhân hóa cho người dùng.

## Kiến trúc hệ thống

### Công nghệ sử dụng

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Cloudflare Workers
- **Cơ sở dữ liệu**: Cloudflare D1 (SQLite)
- **Xác thực**: JWT (JSON Web Tokens)
- **Tích hợp AI**: OpenAI API, Google AI API

### Cấu trúc thư mục

```
viet-edu-app/
├── migrations/            # SQL migrations cho cơ sở dữ liệu
├── public/                # Tài nguyên tĩnh
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── auth/          # Trang xác thực
│   │   ├── dashboard/     # Trang bảng điều khiển
│   │   ├── subjects/      # Trang môn học
│   │   ├── lessons/       # Trang bài học
│   │   ├── quizzes/       # Trang bài kiểm tra
│   │   ├── profile/       # Trang hồ sơ người dùng
│   │   ├── admin/         # Trang quản trị
│   │   ├── ai-integration/# Trang tích hợp AI
│   │   ├── ai-analysis/   # Trang phân tích AI
│   │   └── ...
│   ├── components/        # React components
│   │   ├── ui/            # UI components
│   │   ├── layout/        # Layout components
│   │   ├── auth/          # Auth components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── subjects/      # Subject components
│   │   ├── lessons/       # Lesson components
│   │   ├── quizzes/       # Quiz components
│   │   ├── profile/       # Profile components
│   │   └── admin/         # Admin components
│   ├── lib/               # Utility functions
│   │   ├── db/            # Database models
│   │   ├── auth/          # Authentication utilities
│   │   ├── content/       # Content management
│   │   ├── quiz/          # Quiz management
│   │   ├── progress/      # Progress tracking
│   │   ├── recommendation/# Recommendation system
│   │   ├── ai/            # AI integration
│   │   └── utils/         # Utility functions
│   └── hooks/             # Custom React hooks
├── wrangler.toml          # Cloudflare configuration
└── ...
```

## Mô hình cơ sở dữ liệu

### Bảng users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'student',
  grade_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng subjects

```sql
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng grades

```sql
CREATE TABLE grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng lessons

```sql
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  subject_id INTEGER NOT NULL,
  grade_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  difficulty_level TEXT DEFAULT 'basic',
  estimated_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (grade_id) REFERENCES grades(id)
);
```

### Bảng quizzes

```sql
CREATE TABLE quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  subject_id INTEGER NOT NULL,
  grade_id INTEGER NOT NULL,
  lesson_id INTEGER,
  quiz_type TEXT DEFAULT 'practice',
  difficulty_level TEXT DEFAULT 'basic',
  time_limit INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (grade_id) REFERENCES grades(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
```

### Bảng questions

```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'single_choice',
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

### Bảng options

```sql
CREATE TABLE options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

### Bảng user_progress

```sql
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
```

### Bảng quiz_results

```sql
CREATE TABLE quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  time_spent INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

### Bảng user_answers

```sql
CREATE TABLE user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_result_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  option_id INTEGER,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_result_id) REFERENCES quiz_results(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (option_id) REFERENCES options(id)
);
```

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại

### Môn học

- `GET /api/subjects` - Lấy danh sách môn học
- `GET /api/subjects/:id` - Lấy thông tin chi tiết môn học
- `POST /api/subjects` - Tạo môn học mới (admin)
- `PUT /api/subjects/:id` - Cập nhật môn học (admin)
- `DELETE /api/subjects/:id` - Xóa môn học (admin)

### Bài học

- `GET /api/lessons` - Lấy danh sách bài học
- `GET /api/lessons/:id` - Lấy thông tin chi tiết bài học
- `POST /api/lessons` - Tạo bài học mới (admin)
- `PUT /api/lessons/:id` - Cập nhật bài học (admin)
- `DELETE /api/lessons/:id` - Xóa bài học (admin)

### Bài kiểm tra

- `GET /api/quizzes` - Lấy danh sách bài kiểm tra
- `GET /api/quizzes/:id` - Lấy thông tin chi tiết bài kiểm tra
- `POST /api/quizzes/submit` - Nộp bài kiểm tra
- `GET /api/quizzes/history` - Lấy lịch sử làm bài kiểm tra
- `POST /api/quizzes` - Tạo bài kiểm tra mới (admin)
- `PUT /api/quizzes/:id` - Cập nhật bài kiểm tra (admin)
- `DELETE /api/quizzes/:id` - Xóa bài kiểm tra (admin)

### Tiến trình học tập

- `GET /api/progress/user` - Lấy tiến trình học tập tổng quan
- `GET /api/progress/subject` - Lấy tiến trình học tập theo môn học
- `GET /api/progress/report` - Lấy báo cáo tiến trình học tập
- `POST /api/progress/update` - Cập nhật tiến trình học tập

### Đề xuất

- `GET /api/recommendations/lessons` - Lấy đề xuất bài học
- `GET /api/recommendations/quizzes` - Lấy đề xuất bài kiểm tra
- `GET /api/recommendations/learning-path` - Lấy lộ trình học tập

### Tích hợp AI

- `POST /api/ai/generate-content` - Sinh nội dung học tập bằng AI
- `POST /api/ai/analyze-learning` - Phân tích dữ liệu học tập bằng AI

### Tìm kiếm và thu thập nội dung

- `GET /api/content/search` - Tìm kiếm nội dung học tập
- `GET /api/content/recommend` - Đề xuất nội dung học tập
- `POST /api/content/scrape` - Thu thập nội dung từ internet

## Xác thực và phân quyền

### Cơ chế xác thực

VietEdu sử dụng JWT (JSON Web Tokens) để xác thực người dùng. Khi người dùng đăng nhập, hệ thống tạo một token JWT và lưu trữ trong cookie. Token này được gửi kèm theo mỗi request để xác thực người dùng.

### Phân quyền

Hệ thống có 3 vai trò chính:

1. **student**: Học sinh, có quyền truy cập các bài học, làm bài kiểm tra, xem tiến trình học tập.
2. **teacher**: Giáo viên, có quyền truy cập tất cả các tính năng của học sinh, đồng thời có thể sử dụng tính năng AI để sinh nội dung và phân tích dữ liệu học tập.
3. **admin**: Quản trị viên, có quyền truy cập tất cả các tính năng của hệ thống, bao gồm quản lý người dùng, quản lý nội dung, và các tính năng quản trị khác.

## Tích hợp AI

### OpenAI

VietEdu tích hợp với OpenAI API để sinh nội dung học tập và phân tích dữ liệu học tập. Các model được hỗ trợ bao gồm:

- GPT-4
- GPT-4 Turbo
- GPT-3.5 Turbo

### Google AI

VietEdu cũng tích hợp với Google AI API để sinh nội dung học tập và phân tích dữ liệu học tập. Các model được hỗ trợ bao gồm:

- Gemini Pro
- Gemini Ultra
- PaLM 2

### Sinh nội dung học tập

Tính năng sinh nội dung học tập cho phép giáo viên và admin tạo bài học và bài kiểm tra tự động bằng AI. Người dùng có thể cấu hình các tham số như nhà cung cấp AI, model, môn học, lớp, chủ đề, và độ khó.

### Phân tích dữ liệu học tập

Tính năng phân tích dữ liệu học tập cho phép giáo viên và admin phân tích tiến trình học tập của học sinh. Hệ thống sẽ phân tích dữ liệu và đưa ra các đề xuất cải thiện, lộ trình học tập cá nhân hóa, và dự đoán kết quả học tập.

## Hướng dẫn triển khai

### Yêu cầu hệ thống

- Node.js 18.0.0 trở lên
- npm 7.0.0 trở lên
- Tài khoản Cloudflare (để sử dụng Cloudflare Workers và D1)

### Cài đặt

1. Clone repository:

```bash
git clone https://github.com/your-username/viet-edu-platform.git
cd viet-edu-platform/viet-edu-app
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file `.env.local` với các biến môi trường cần thiết:

```
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# JWT
JWT_SECRET=your_jwt_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

4. Khởi tạo cơ sở dữ liệu:

```bash
npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

5. Chạy ứng dụng trong môi trường phát triển:

```bash
npm run dev
```

### Triển khai lên môi trường sản xuất

1. Đăng nhập vào Cloudflare:

```bash
npx wrangler login
```

2. Tạo cơ sở dữ liệu D1:

```bash
npx wrangler d1 create viet-edu-db
```

3. Cập nhật `wrangler.toml` với ID của cơ sở dữ liệu:

```toml
[[d1_databases]]
binding = "DB"
database_name = "viet-edu-db"
database_id = "your_database_id"
```

4. Áp dụng migrations:

```bash
npx wrangler d1 migrations apply viet-edu-db
```

5. Triển khai ứng dụng:

```bash
npm run deploy
```

## Bảo trì và cập nhật

### Cập nhật cơ sở dữ liệu

Để thêm bảng mới hoặc sửa đổi bảng hiện có, tạo một file migration mới trong thư mục `migrations/` và áp dụng migration:

```bash
npx wrangler d1 migrations apply viet-edu-db
```

### Cập nhật ứng dụng

1. Pull các thay đổi mới nhất từ repository:

```bash
git pull origin main
```

2. Cài đặt dependencies mới:

```bash
npm install
```

3. Triển khai lại ứng dụng:

```bash
npm run deploy
```

## Xử lý lỗi thường gặp

### Lỗi xác thực

- Kiểm tra JWT_SECRET trong file `.env.local`
- Đảm bảo cookie được gửi kèm theo mỗi request
- Kiểm tra thời hạn của token JWT

### Lỗi cơ sở dữ liệu

- Kiểm tra kết nối đến cơ sở dữ liệu D1
- Đảm bảo các migrations đã được áp dụng
- Kiểm tra quyền truy cập cơ sở dữ liệu

### Lỗi tích hợp AI

- Kiểm tra API key của OpenAI và Google AI
- Đảm bảo các model được chọn có sẵn
- Kiểm tra định dạng của prompt gửi đến API

## Liên hệ hỗ trợ kỹ thuật

Nếu bạn gặp bất kỳ vấn đề kỹ thuật nào khi triển khai hoặc sử dụng VietEdu, vui lòng liên hệ với chúng tôi qua:

- Email: tech-support@vietedu.edu.vn
- GitHub Issues: https://github.com/your-username/viet-edu-platform/issues
