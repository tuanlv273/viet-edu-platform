// src/lib/progress/progressManager.ts
// Quản lý hệ thống theo dõi tiến trình học tập

import { getUserProgress, updateUserProgress as saveUserProgress, getUserLessonProgress, getUserQuizResults } from '../db/models/progress';
import { getLessonsBySubjectAndGrade } from '../db/models/lesson';
import { getQuizzesBySubjectAndGrade } from '../db/models/quiz';

// Interface cho tiến trình học tập của người dùng
export interface UserProgress {
  userId: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lastActivity: string;
  subjectProgress: {
    subjectId: number;
    subjectName: string;
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    averageScore: number;
  }[];
}

// Interface cho tiến trình chi tiết của một môn học
export interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  gradeId: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lessonProgress: {
    lessonId: number;
    lessonTitle: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completionPercentage: number;
    lastAccessed: string | null;
  }[];
  quizResults: {
    quizId: number;
    quizTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
  }[];
}

// Interface cho báo cáo tiến trình học tập
export interface ProgressReport {
  userId: number;
  period: 'week' | 'month' | 'semester' | 'year';
  startDate: string;
  endDate: string;
  totalStudyTime: number; // phút
  completedLessons: number;
  completedQuizzes: number;
  averageScore: number;
  subjectBreakdown: {
    subjectId: number;
    subjectName: string;
    studyTime: number; // phút
    completedLessons: number;
    completedQuizzes: number;
    averageScore: number;
  }[];
  weeklyActivity: {
    date: string;
    studyTime: number; // phút
    lessonsCompleted: number;
    quizzesCompleted: number;
  }[];
}

// Lấy tiến trình học tập tổng quan của người dùng
export async function getUserOverallProgress(userId: number): Promise<UserProgress> {
  try {
    // Lấy tiến trình học tập của người dùng
    const progress = await getUserProgress(userId);
    
    // Tính toán các chỉ số tổng quan
    const userProgress: UserProgress = {
      userId,
      completedLessons: 0,
      totalLessons: 0,
      completedQuizzes: 0,
      totalQuizzes: 0,
      averageScore: 0,
      lastActivity: new Date().toISOString(),
      subjectProgress: []
    };
    
    // Đảm bảo progress là một mảng
    const progressArray = Array.isArray(progress) ? progress : [];
    
    // Tính toán tiến trình cho từng môn học
    for (const subjectProgress of progressArray) {
      // Extract and map data from DB fields (snake_case) to our application model (camelCase)
      const completedLessons = subjectProgress.completed_lessons || 0;
      const totalLessons = subjectProgress.total_lessons || 0;
      const completedQuizzes = subjectProgress.completed_quizzes || 0;
      const totalQuizzes = subjectProgress.total_quizzes || 0;
      const averageScore = subjectProgress.average_score || 0;
      
      userProgress.completedLessons += completedLessons;
      userProgress.totalLessons += totalLessons;
      userProgress.completedQuizzes += completedQuizzes;
      userProgress.totalQuizzes += totalQuizzes;
      
      // Tính điểm trung bình có trọng số
      if (completedQuizzes > 0) {
        userProgress.subjectProgress.push({
          subjectId: subjectProgress.subject_id,
          subjectName: subjectProgress.subject_name,
          completedLessons: completedLessons,
          totalLessons: totalLessons,
          completedQuizzes: completedQuizzes,
          totalQuizzes: totalQuizzes,
          averageScore: averageScore
        });
      }
    }
    
    // Tính điểm trung bình tổng thể
    if (userProgress.completedQuizzes > 0) {
      let totalScorePoints = 0;
      for (const subject of userProgress.subjectProgress) {
        totalScorePoints += subject.averageScore * subject.completedQuizzes;
      }
      userProgress.averageScore = Math.round(totalScorePoints / userProgress.completedQuizzes);
    }
    
    return userProgress;
  } catch (error) {
    console.error('Error getting user overall progress:', error);
    throw error;
  }
}

// Lấy tiến trình học tập chi tiết của một môn học
export async function getSubjectProgressDetail(
  userId: number,
  subjectId: number,
  gradeId: number
): Promise<SubjectProgress> {
  try {
    // Lấy danh sách bài học của môn học
    const lessons = await getLessonsBySubjectAndGrade(subjectId, gradeId);
    
    // Lấy danh sách bài kiểm tra của môn học
    const quizzes = await getQuizzesBySubjectAndGrade(subjectId, gradeId);
    
    // Lấy tiến trình bài học của người dùng
    const lessonProgress = await Promise.all(
      lessons.map(async (lesson) => {
        const progress = await getUserLessonProgress(userId, lesson.id);
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          status: progress?.status || 'not_started',
          completionPercentage: progress?.progress_percentage || 0,
          lastAccessed: progress?.last_accessed_at || null
        };
      })
    );
    
    // Lấy kết quả bài kiểm tra của người dùng
    const quizResults = await getUserQuizResults(userId);
    
    // Lọc kết quả bài kiểm tra theo môn học
    const subjectQuizResults = quizResults.filter(result => {
      const quiz = quizzes.find(q => q.id === result.quiz_id);
      return quiz !== undefined;
    });
    
    // Tính toán các chỉ số
    const completedLessons = lessonProgress.filter(p => p.status === 'completed').length;
    const totalLessons = lessons.length;
    const completedQuizzes = subjectQuizResults.length;
    const totalQuizzes = quizzes.length;
    
    // Tính điểm trung bình
    let averageScore = 0;
    if (completedQuizzes > 0) {
      const totalScore = subjectQuizResults.reduce((sum, result) => sum + (result.score / result.total_questions * 100), 0);
      averageScore = Math.round(totalScore / completedQuizzes);
    }
    
    // Tạo đối tượng tiến trình môn học
    const subjectProgress: SubjectProgress = {
      subjectId,
      subjectName: lessons[0]?.subject_name || `Môn học ${subjectId}`,
      gradeId,
      completedLessons,
      totalLessons,
      completedQuizzes,
      totalQuizzes,
      averageScore,
      lessonProgress,
      quizResults: subjectQuizResults.map(result => ({
        quizId: result.quiz_id,
        quizTitle: result.quiz_title || `Bài kiểm tra ${result.quiz_id}`,
        score: result.score,
        maxScore: result.total_questions,
        percentage: Math.round((result.score / result.total_questions) * 100),
        passed: result.passed,
        submittedAt: result.completed_at
      }))
    };
    
    return subjectProgress;
  } catch (error) {
    console.error('Error getting subject progress detail:', error);
    throw error;
  }
}

// Tạo báo cáo tiến trình học tập
export async function generateProgressReport(
  userId: number,
  period: 'week' | 'month' | 'semester' | 'year'
): Promise<ProgressReport> {
  try {
    // Xác định khoảng thời gian báo cáo
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Lấy tiến trình học tập trong khoảng thời gian
    const progressItems = await getUserProgress(userId);
    
    // Tạo báo cáo tiến trình
    const report: ProgressReport = {
      userId,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalStudyTime: 0,
      completedLessons: 0,
      completedQuizzes: 0,
      averageScore: 0,
      subjectBreakdown: [],
      weeklyActivity: []
    };
    
    // Tính toán các chỉ số
    if (progressItems && progressItems.length > 0) {
      // Giả lập dữ liệu báo cáo
      report.totalStudyTime = Math.floor(Math.random() * 1000) + 500; // 500-1500 phút
      report.completedLessons = progressItems.reduce((sum, p) => sum + (p.completed_lessons || 0), 0);
      report.completedQuizzes = progressItems.reduce((sum, p) => sum + (p.completed_quizzes || 0), 0);
      
      // Tính điểm trung bình
      let totalScorePoints = 0;
      let totalQuizzes = 0;
      
      for (const subject of progressItems) {
        if (subject.completed_quizzes && subject.completed_quizzes > 0) {
          totalScorePoints += (subject.average_score || 0) * subject.completed_quizzes;
          totalQuizzes += subject.completed_quizzes;
          
          report.subjectBreakdown.push({
            subjectId: subject.subject_id,
            subjectName: subject.subject_name,
            studyTime: Math.floor(Math.random() * 300) + 100, // 100-400 phút
            completedLessons: subject.completed_lessons || 0,
            completedQuizzes: subject.completed_quizzes,
            averageScore: subject.average_score || 0
          });
        }
      }
      
      if (totalQuizzes > 0) {
        report.averageScore = Math.round(totalScorePoints / totalQuizzes);
      }
      
      // Tạo dữ liệu hoạt động hàng tuần
      const daysToGenerate = period === 'week' ? 7 : 30;
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        report.weeklyActivity.push({
          date: date.toISOString().split('T')[0],
          studyTime: Math.floor(Math.random() * 120), // 0-120 phút
          lessonsCompleted: Math.floor(Math.random() * 3), // 0-2 bài học
          quizzesCompleted: Math.random() > 0.7 ? 1 : 0 // 30% có làm bài kiểm tra
        });
      }
    }
    
    return report;
  } catch (error) {
    console.error('Error generating progress report:', error);
    throw error;
  }
}

// Cập nhật tiến trình học tập của bài học
export async function updateLessonProgress(
  userId: number,
  lessonId: number,
  status: 'not_started' | 'in_progress' | 'completed',
  completionPercentage: number
): Promise<void> {
  try {
    await saveUserProgress({
      user_id: userId,
      lesson_id: lessonId,
      status,
      progress_percentage: completionPercentage,
      last_accessed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
}

// Lấy đề xuất học tập dựa trên tiến trình
export async function getLearningRecommendations(userId: number, gradeId: number) {
  try {
    // Lấy tiến trình học tập của người dùng
    const progressItems = await getUserProgress(userId);
    
    // Tìm các bài học chưa hoàn thành
    const incompleteSubjects = [];
    
    for (const subject of progressItems || []) {
      const completedLessons = subject.completed_lessons || 0;
      const totalLessons = subject.total_lessons || 0;
      
      if (completedLessons < totalLessons) {
        incompleteSubjects.push({
          subjectId: subject.subject_id,
          subjectName: subject.subject_name,
          completionPercentage: Math.round((completedLessons / totalLessons) * 100)
        });
      }
    }
    
    // Sắp xếp theo mức độ hoàn thành (ưu tiên môn học đã bắt đầu nhưng chưa hoàn thành)
    incompleteSubjects.sort((a, b) => {
      if (a.completionPercentage === 0 && b.completionPercentage > 0) return 1;
      if (a.completionPercentage > 0 && b.completionPercentage === 0) return -1;
      return a.completionPercentage - b.completionPercentage;
    });
    
    // Lấy các bài học được đề xuất
    const recommendations = [];
    
    for (const subject of incompleteSubjects.slice(0, 3)) {
      // Lấy danh sách bài học của môn học
      const lessons = await getLessonsBySubjectAndGrade(subject.subjectId, gradeId);
      
      // Lấy tiến trình bài học của người dùng
      const lessonProgress = await Promise.all(
        lessons.map(async (lesson) => {
          const progress = await getUserLessonProgress(userId, lesson.id);
          return {
            lesson,
            status: progress?.status || 'not_started',
            completionPercentage: progress?.progress_percentage || 0
          };
        })
      );
      
      // Tìm bài học tiếp theo cần học
      const nextLessons = lessonProgress
        .filter(p => p.status !== 'completed')
        .sort((a, b) => {
          // Ưu tiên bài học đang học
          if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
          if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
          // Sau đó sắp xếp theo thứ tự bài học
          return a.lesson.order_index - b.lesson.order_index;
        })
        .slice(0, 2)
        .map(p => p.lesson);
      
      if (nextLessons.length > 0) {
        recommendations.push({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          recommendations: nextLessons
        });
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error getting learning recommendations:', error);
    throw error;
  }
}
