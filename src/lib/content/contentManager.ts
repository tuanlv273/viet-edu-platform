// src/lib/content/contentManager.ts
// Quản lý nội dung học tập

import { Subject, Lesson, LessonContent, Quiz } from '../db/schema';
import { getAllSubjects, getSubjectById, getSubjectsByGrade } from '../db/models/subject';
import { getLessonsBySubjectAndGrade, getLessonById, getLessonContents } from '../db/models/lesson';
import { getQuizzesBySubjectAndGrade, getQuizzesByLesson } from '../db/models/quiz';

// Interface cho cấu trúc nội dung học tập
export interface ContentStructure {
  subjects: Subject[];
  selectedSubject?: Subject;
  lessons?: Lesson[];
  selectedLesson?: Lesson & { contents?: LessonContent[] };
  quizzes?: Quiz[];
}

// Lấy cấu trúc nội dung theo lớp
export async function getContentStructureByGrade(gradeId: number): Promise<ContentStructure> {
  try {
    const subjects = await getSubjectsByGrade(gradeId);
    
    return {
      subjects
    };
  } catch (error) {
    console.error('Error getting content structure by grade:', error);
    throw error;
  }
}

// Lấy cấu trúc nội dung theo lớp và môn học
export async function getContentStructureByGradeAndSubject(
  gradeId: number,
  subjectId: number
): Promise<ContentStructure> {
  try {
    const subjects = await getSubjectsByGrade(gradeId);
    const selectedSubject = await getSubjectById(subjectId);
    const lessons = await getLessonsBySubjectAndGrade(subjectId, gradeId);
    const quizzes = await getQuizzesBySubjectAndGrade(subjectId, gradeId);
    
    return {
      subjects,
      selectedSubject,
      lessons,
      quizzes
    };
  } catch (error) {
    console.error('Error getting content structure by grade and subject:', error);
    throw error;
  }
}

// Lấy chi tiết bài học
export async function getLessonDetails(lessonId: number): Promise<Lesson & { contents: LessonContent[] }> {
  try {
    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    
    const contents = await getLessonContents(lessonId);
    
    return {
      ...lesson,
      contents
    };
  } catch (error) {
    console.error('Error getting lesson details:', error);
    throw error;
  }
}

// Lấy cấu trúc nội dung đầy đủ cho bài học
export async function getFullContentStructureForLesson(
  lessonId: number
): Promise<ContentStructure> {
  try {
    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    
    const contents = await getLessonContents(lessonId);
    const selectedLesson = { ...lesson, contents };
    
    const subjects = await getSubjectsByGrade(lesson.grade_id);
    const selectedSubject = await getSubjectById(lesson.subject_id);
    const lessons = await getLessonsBySubjectAndGrade(lesson.subject_id, lesson.grade_id);
    const quizzes = await getQuizzesByLesson(lessonId);
    
    return {
      subjects,
      selectedSubject,
      lessons,
      selectedLesson,
      quizzes
    };
  } catch (error) {
    console.error('Error getting full content structure for lesson:', error);
    throw error;
  }
}

// Tìm kiếm nội dung học tập
export async function searchContent(query: string, gradeId?: number): Promise<{
  lessons: Lesson[];
  quizzes: Quiz[];
}> {
  try {
    // Tìm kiếm trong cơ sở dữ liệu
    // Đây là một triển khai đơn giản, trong thực tế cần sử dụng full-text search
    
    // Tạo câu truy vấn SQL để tìm kiếm bài học
    let lessonSql = `
      SELECT l.* FROM lessons l
      JOIN subjects s ON l.subject_id = s.id
      WHERE (l.title LIKE ? OR l.description LIKE ? OR s.name LIKE ?)
    `;
    
    // Tạo câu truy vấn SQL để tìm kiếm bài kiểm tra
    let quizSql = `
      SELECT q.* FROM quizzes q
      JOIN subjects s ON q.subject_id = s.id
      WHERE (q.title LIKE ? OR q.description LIKE ? OR s.name LIKE ?)
    `;
    
    // Thêm điều kiện lớp nếu có
    if (gradeId) {
      lessonSql += ' AND l.grade_id = ?';
      quizSql += ' AND q.grade_id = ?';
    }
    
    // Thực hiện truy vấn
    const searchPattern = `%${query}%`;
    const lessonParams = [searchPattern, searchPattern, searchPattern];
    const quizParams = [searchPattern, searchPattern, searchPattern];
    
    if (gradeId) {
      lessonParams.push(gradeId);
      quizParams.push(gradeId);
    }
    
    // Giả định có hàm query từ module db
    const { query: dbQuery } = await import('../db/client');
    
    const lessons = await dbQuery(lessonSql, lessonParams);
    const quizzes = await dbQuery(quizSql, quizParams);
    
    return {
      lessons,
      quizzes
    };
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
}

// Lấy nội dung đề xuất dựa trên tiến trình học tập của người dùng
export async function getRecommendedContent(userId: number, gradeId: number): Promise<{
  lessons: Lesson[];
  quizzes: Quiz[];
}> {
  try {
    // Lấy tiến trình học tập của người dùng
    const { getUserProgress, getUserQuizResults } = await import('../db/models/progress');
    const userProgress = await getUserProgress(userId);
    const userQuizResults = await getUserQuizResults(userId);
    
    // Lấy danh sách bài học đã hoàn thành
    const completedLessonIds = userProgress
      .filter(progress => progress.status === 'completed')
      .map(progress => progress.lesson_id);
    
    // Lấy danh sách bài kiểm tra đã hoàn thành
    const completedQuizIds = userQuizResults
      .filter(result => result.passed)
      .map(result => result.quiz_id);
    
    // Lấy danh sách môn học của lớp
    const subjects = await getSubjectsByGrade(gradeId);
    
    // Danh sách bài học và bài kiểm tra đề xuất
    let recommendedLessons: Lesson[] = [];
    let recommendedQuizzes: Quiz[] = [];
    
    // Duyệt qua từng môn học để lấy bài học và bài kiểm tra tiếp theo
    for (const subject of subjects) {
      // Lấy tất cả bài học của môn học và lớp
      const lessons = await getLessonsBySubjectAndGrade(subject.id, gradeId);
      
      // Sắp xếp bài học theo thứ tự
      lessons.sort((a, b) => a.order_index - b.order_index);
      
      // Tìm bài học tiếp theo chưa hoàn thành
      const nextLesson = lessons.find(lesson => !completedLessonIds.includes(lesson.id));
      if (nextLesson) {
        recommendedLessons.push(nextLesson);
      }
      
      // Lấy tất cả bài kiểm tra của môn học và lớp
      const quizzes = await getQuizzesBySubjectAndGrade(subject.id, gradeId);
      
      // Tìm bài kiểm tra tiếp theo chưa hoàn thành
      const nextQuiz = quizzes.find(quiz => !completedQuizIds.includes(quiz.id));
      if (nextQuiz) {
        recommendedQuizzes.push(nextQuiz);
      }
    }
    
    return {
      lessons: recommendedLessons,
      quizzes: recommendedQuizzes
    };
  } catch (error) {
    console.error('Error getting recommended content:', error);
    throw error;
  }
}
