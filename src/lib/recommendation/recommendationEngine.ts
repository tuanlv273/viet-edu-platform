// src/lib/recommendation/recommendationEngine.ts
// Hệ thống đề xuất lộ trình học tập và nội dung học tập

import { getUserOverallProgress, getSubjectProgressDetail } from '../progress/progressManager';
import { getLessonsBySubjectAndGrade } from '../db/models/lesson';
import { getQuizzesBySubjectAndGrade } from '../db/models/quiz';
import { getSubjectsByGrade } from '../db/models/subject';

// Interface cho đề xuất bài học
export interface LessonRecommendation {
  lessonId: number;
  lessonTitle: string;
  subjectId: number;
  subjectName: string;
  gradeId: number;
  difficulty: string;
  relevanceScore: number;
  reason: string;
}

// Interface cho đề xuất bài kiểm tra
export interface QuizRecommendation {
  quizId: number;
  quizTitle: string;
  subjectId: number;
  subjectName: string;
  gradeId: number;
  difficulty: string;
  quizType: string;
  relevanceScore: number;
  reason: string;
}

// Interface cho lộ trình học tập
export interface LearningPath {
  userId: number;
  gradeId: number;
  generatedAt: string;
  expiresAt: string;
  subjects: {
    subjectId: number;
    subjectName: string;
    priority: number;
    completionPercentage: number;
    recommendedLessons: {
      lessonId: number;
      lessonTitle: string;
      order: number;
      estimatedTimeMinutes: number;
    }[];
    recommendedQuizzes: {
      quizId: number;
      quizTitle: string;
      order: number;
      difficulty: string;
      quizType: string;
    }[];
  }[];
}

/**
 * Tạo đề xuất bài học dựa trên tiến trình học tập của người dùng
 * @param userId ID của người dùng
 * @param gradeId ID của lớp
 * @param limit Số lượng đề xuất tối đa
 */
export async function generateLessonRecommendations(
  userId: number,
  gradeId: number,
  limit: number = 5
): Promise<LessonRecommendation[]> {
  try {
    // Lấy tiến trình học tập tổng quan của người dùng
    const userProgress = await getUserOverallProgress(userId);
    
    // Lấy danh sách môn học
    const subjects = await getSubjectsByGrade(gradeId);
    
    const recommendations: LessonRecommendation[] = [];
    
    // Tính toán điểm ưu tiên cho từng môn học
    const subjectPriorities = subjects.map(subject => {
      const subjectProgress = userProgress.subjectProgress.find(
        sp => sp.subjectId === subject.id
      );
      
      // Nếu không có tiến trình, ưu tiên cao
      if (!subjectProgress) {
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          priority: 100,
          completionPercentage: 0
        };
      }
      
      // Tính điểm ưu tiên dựa trên tiến độ hoàn thành
      // Môn học có tiến độ thấp sẽ có ưu tiên cao hơn
      const completionPercentage = subjectProgress.completedLessons / subjectProgress.totalLessons;
      
      // Điểm ưu tiên từ 0-100, ngược với phần trăm hoàn thành
      const priority = 100 - (completionPercentage * 100);
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        priority,
        completionPercentage: completionPercentage * 100
      };
    });
    
    // Sắp xếp môn học theo ưu tiên giảm dần
    subjectPriorities.sort((a, b) => b.priority - a.priority);
    
    // Lấy đề xuất bài học cho các môn học ưu tiên cao
    for (const subjectPriority of subjectPriorities) {
      if (recommendations.length >= limit) break;
      
      // Lấy tiến trình chi tiết của môn học
      const subjectProgress = await getSubjectProgressDetail(
        userId,
        subjectPriority.subjectId,
        gradeId
      );
      
      // Lấy danh sách bài học của môn học
      const lessons = await getLessonsBySubjectAndGrade(
        subjectPriority.subjectId,
        gradeId
      );
      
      // Tìm các bài học chưa hoàn thành
      const incompleteLessons = lessons.filter(lesson => {
        const lessonProgress = subjectProgress.lessonProgress.find(
          lp => lp.lessonId === lesson.id
        );
        
        return !lessonProgress || lessonProgress.status !== 'completed';
      });
      
      // Sắp xếp bài học theo thứ tự
      incompleteLessons.sort((a, b) => {
        // Ưu tiên bài học đang học
        const progressA = subjectProgress.lessonProgress.find(lp => lp.lessonId === a.id);
        const progressB = subjectProgress.lessonProgress.find(lp => lp.lessonId === b.id);
        
        if (progressA?.status === 'in_progress' && progressB?.status !== 'in_progress') return -1;
        if (progressA?.status !== 'in_progress' && progressB?.status === 'in_progress') return 1;
        
        // Sau đó sắp xếp theo thứ tự bài học
        return a.order_index - b.order_index;
      });
      
      // Thêm các bài học vào danh sách đề xuất
      for (const lesson of incompleteLessons) {
        if (recommendations.length >= limit) break;
        
        const lessonProgress = subjectProgress.lessonProgress.find(
          lp => lp.lessonId === lesson.id
        );
        
        let reason = '';
        if (lessonProgress?.status === 'in_progress') {
          reason = 'Bài học đang học dở';
        } else if (subjectPriority.completionPercentage < 30) {
          reason = 'Môn học cần được ưu tiên';
        } else {
          reason = 'Bài học tiếp theo trong lộ trình';
        }
        
        recommendations.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          subjectId: subjectPriority.subjectId,
          subjectName: subjectPriority.subjectName,
          gradeId,
          difficulty: lesson.difficulty_level,
          relevanceScore: subjectPriority.priority,
          reason
        });
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating lesson recommendations:', error);
    throw error;
  }
}

/**
 * Tạo đề xuất bài kiểm tra dựa trên tiến trình học tập của người dùng
 * @param userId ID của người dùng
 * @param gradeId ID của lớp
 * @param limit Số lượng đề xuất tối đa
 */
export async function generateQuizRecommendations(
  userId: number,
  gradeId: number,
  limit: number = 5
): Promise<QuizRecommendation[]> {
  try {
    // Lấy tiến trình học tập tổng quan của người dùng
    const userProgress = await getUserOverallProgress(userId);
    
    // Lấy danh sách môn học
    const subjects = await getSubjectsByGrade(gradeId);
    
    const recommendations: QuizRecommendation[] = [];
    
    // Tính toán điểm ưu tiên cho từng môn học
    const subjectPriorities = subjects.map(subject => {
      const subjectProgress = userProgress.subjectProgress.find(
        sp => sp.subjectId === subject.id
      );
      
      // Nếu không có tiến trình, ưu tiên thấp vì chưa học
      if (!subjectProgress) {
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          priority: 0,
          completionPercentage: 0
        };
      }
      
      // Tính điểm ưu tiên dựa trên tiến độ hoàn thành bài học
      // Môn học có tiến độ bài học cao nhưng ít làm bài kiểm tra sẽ có ưu tiên cao
      const lessonCompletionPercentage = subjectProgress.completedLessons / subjectProgress.totalLessons;
      const quizCompletionPercentage = subjectProgress.completedQuizzes / subjectProgress.totalQuizzes;
      
      // Điểm ưu tiên từ 0-100
      // Ưu tiên cao cho môn học đã học nhiều nhưng ít làm bài kiểm tra
      const priority = (lessonCompletionPercentage * 100) - (quizCompletionPercentage * 50);
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        priority: Math.max(0, Math.min(100, priority)),
        completionPercentage: lessonCompletionPercentage * 100
      };
    });
    
    // Sắp xếp môn học theo ưu tiên giảm dần
    subjectPriorities.sort((a, b) => b.priority - a.priority);
    
    // Lấy đề xuất bài kiểm tra cho các môn học ưu tiên cao
    for (const subjectPriority of subjectPriorities) {
      if (recommendations.length >= limit) break;
      
      // Bỏ qua môn học chưa học
      if (subjectPriority.completionPercentage < 10) continue;
      
      // Lấy tiến trình chi tiết của môn học
      const subjectProgress = await getSubjectProgressDetail(
        userId,
        subjectPriority.subjectId,
        gradeId
      );
      
      // Lấy danh sách bài kiểm tra của môn học
      const quizzes = await getQuizzesBySubjectAndGrade(
        subjectPriority.subjectId,
        gradeId
      );
      
      // Tìm các bài kiểm tra chưa làm
      const incompleteQuizzes = quizzes.filter(quiz => {
        const quizResult = subjectProgress.quizResults.find(
          qr => qr.quizId === quiz.id
        );
        
        return !quizResult;
      });
      
      // Sắp xếp bài kiểm tra theo độ khó và loại
      incompleteQuizzes.sort((a, b) => {
        // Ưu tiên bài kiểm tra luyện tập trước
        if (a.quiz_type === 'practice' && b.quiz_type !== 'practice') return -1;
        if (a.quiz_type !== 'practice' && b.quiz_type === 'practice') return 1;
        
        // Sau đó sắp xếp theo độ khó tăng dần
        const difficultyOrder = { 'basic': 0, 'intermediate': 1, 'advanced': 2 };
        return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
      });
      
      // Thêm các bài kiểm tra vào danh sách đề xuất
      for (const quiz of incompleteQuizzes) {
        if (recommendations.length >= limit) break;
        
        let reason = '';
        if (quiz.quiz_type === 'practice') {
          reason = 'Bài kiểm tra luyện tập phù hợp với tiến độ học tập';
        } else if (quiz.quiz_type === 'midterm') {
          reason = 'Bài kiểm tra giữa kỳ để đánh giá kiến thức';
        } else {
          reason = 'Bài kiểm tra cuối kỳ để tổng kết kiến thức';
        }
        
        recommendations.push({
          quizId: quiz.id,
          quizTitle: quiz.title,
          subjectId: subjectPriority.subjectId,
          subjectName: subjectPriority.subjectName,
          gradeId,
          difficulty: quiz.difficulty_level,
          quizType: quiz.quiz_type,
          relevanceScore: subjectPriority.priority,
          reason
        });
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating quiz recommendations:', error);
    throw error;
  }
}

/**
 * Tạo lộ trình học tập cá nhân hóa cho người dùng
 * @param userId ID của người dùng
 * @param gradeId ID của lớp
 */
export async function generateLearningPath(
  userId: number,
  gradeId: number
): Promise<LearningPath> {
  try {
    // Lấy tiến trình học tập tổng quan của người dùng
    const userProgress = await getUserOverallProgress(userId);
    
    // Lấy danh sách môn học
    const subjects = await getSubjectsByGrade(gradeId);
    
    // Tính toán ưu tiên cho từng môn học
    const subjectPriorities = subjects.map(subject => {
      const subjectProgress = userProgress.subjectProgress.find(
        sp => sp.subjectId === subject.id
      );
      
      // Nếu không có tiến trình, ưu tiên cao
      if (!subjectProgress) {
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          priority: 100,
          completionPercentage: 0
        };
      }
      
      // Tính điểm ưu tiên dựa trên tiến độ hoàn thành
      const completionPercentage = subjectProgress.completedLessons / subjectProgress.totalLessons;
      
      // Điểm ưu tiên từ 0-100, ngược với phần trăm hoàn thành
      const priority = 100 - (completionPercentage * 100);
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        priority,
        completionPercentage: completionPercentage * 100
      };
    });
    
    // Sắp xếp môn học theo ưu tiên giảm dần
    subjectPriorities.sort((a, b) => b.priority - a.priority);
    
    // Tạo lộ trình học tập
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 7); // Lộ trình có hiệu lực 1 tuần
    
    const learningPath: LearningPath = {
      userId,
      gradeId,
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      subjects: []
    };
    
    // Tạo lộ trình cho từng môn học
    for (const subjectPriority of subjectPriorities) {
      // Lấy tiến trình chi tiết của môn học
      const subjectProgress = await getSubjectProgressDetail(
        userId,
        subjectPriority.subjectId,
        gradeId
      );
      
      // Lấy danh sách bài học của môn học
      const lessons = await getLessonsBySubjectAndGrade(
        subjectPriority.subjectId,
        gradeId
      );
      
      // Lấy danh sách bài kiểm tra của môn học
      const quizzes = await getQuizzesBySubjectAndGrade(
        subjectPriority.subjectId,
        gradeId
      );
      
      // Tìm các bài học chưa hoàn thành
      const incompleteLessons = lessons.filter(lesson => {
        const lessonProgress = subjectProgress.lessonProgress.find(
          lp => lp.lessonId === lesson.id
        );
        
        return !lessonProgress || lessonProgress.status !== 'completed';
      });
      
      // Sắp xếp bài học theo thứ tự
      incompleteLessons.sort((a, b) => {
        // Ưu tiên bài học đang học
        const progressA = subjectProgress.lessonProgress.find(lp => lp.lessonId === a.id);
        const progressB = subjectProgress.lessonProgress.find(lp => lp.lessonId === b.id);
        
        if (progressA?.status === 'in_progress' && progressB?.status !== 'in_progress') return -1;
        if (progressA?.status !== 'in_progress' && progressB?.status === 'in_progress') return 1;
        
        // Sau đó sắp xếp theo thứ tự bài học
        return a.order_index - b.order_index;
      });
      
      // Tìm các bài kiểm tra chưa làm
      const incompleteQuizzes = quizzes.filter(quiz => {
        const quizResult = subjectProgress.quizResults.find(
          qr => qr.quizId === quiz.id
        );
        
        return !quizResult;
      });
      
      // Sắp xếp bài kiểm tra theo độ khó và loại
      incompleteQuizzes.sort((a, b) => {
        // Ưu tiên bài kiểm tra luyện tập trước
        if (a.quiz_type === 'practice' && b.quiz_type !== 'practice') return -1;
        if (a.quiz_type !== 'practice' && b.quiz_type === 'practice') return 1;
        
        // Sau đó sắp xếp theo độ khó tăng dần
        const difficultyOrder = { 'basic': 0, 'intermediate': 1, 'advanced': 2 };
        return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
      });
      
      // Thêm môn học vào lộ trình
      learningPath.subjects.push({
        subjectId: subjectPriority.subjectId,
        subjectName: subjectPriority.subjectName,
        priority: subjectPriority.priority,
        completionPercentage: subjectPriority.completionPercentage,
        recommendedLessons: incompleteLessons.slice(0, 5).map((lesson, index) => ({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          order: index + 1,
          estimatedTimeMinutes: 30 // Thời gian ước tính cho mỗi bài học
        })),
        recommendedQuizzes: incompleteQuizzes.slice(0, 3).map((quiz, index) => ({
          quizId: quiz.id,
          quizTitle: quiz.title,
          order: index + 1,
          difficulty: quiz.difficulty_level,
          quizType: quiz.quiz_type
        }))
      });
    }
    
    return learningPath;
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw error;
  }
}
