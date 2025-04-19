// src/lib/quiz/quizManager.ts
// Quản lý hệ thống kiểm tra

import { Quiz, QuizQuestion, QuizOption, QuizResult } from '../db/schema';
import { getQuizById, getQuizQuestions, getQuizOptions } from '../db/models/quiz';
import { saveQuizResult, getUserQuizResults } from '../db/models/progress';

// Interface cho câu hỏi và lựa chọn
export interface QuestionWithOptions {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'single' | 'multiple';
  points: number;
  order_index: number;
  options: {
    id: number;
    question_id: number;
    option_text: string;
    is_correct: boolean;
    order_index: number;
  }[];
}

// Interface cho bài kiểm tra đầy đủ
export interface FullQuiz {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  lesson_id?: number;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  quiz_type: 'practice' | 'midterm' | 'final';
  time_limit?: number; // Thời gian làm bài (phút)
  passing_score: number; // Điểm đạt (phần trăm)
  questions: QuestionWithOptions[];
}

// Interface cho kết quả bài kiểm tra
export interface QuizSubmission {
  quizId: number;
  userId: number;
  answers: {
    questionId: number;
    selectedOptionIds: number[];
  }[];
  timeSpent: number; // Thời gian làm bài (giây)
}

// Interface cho kết quả chi tiết
export interface QuizResultDetail {
  quizId: number;
  userId: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  submittedAt: string;
  questionResults: {
    questionId: number;
    questionText: string;
    points: number;
    earnedPoints: number;
    isCorrect: boolean;
    selectedOptions: {
      optionId: number;
      optionText: string;
      isCorrect: boolean;
    }[];
    correctOptions: {
      optionId: number;
      optionText: string;
    }[];
  }[];
}

// Lấy thông tin đầy đủ của bài kiểm tra
export async function getFullQuiz(quizId: number): Promise<FullQuiz> {
  try {
    // Lấy thông tin bài kiểm tra
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Lấy danh sách câu hỏi
    const questions = await getQuizQuestions(quizId);
    
    // Lấy danh sách lựa chọn cho từng câu hỏi
    const questionsWithOptions: QuestionWithOptions[] = [];
    
    for (const question of questions) {
      const options = await getQuizOptions(question.id);
      
      questionsWithOptions.push({
        ...question,
        options: options.sort((a, b) => a.order_index - b.order_index)
      });
    }
    
    // Sắp xếp câu hỏi theo thứ tự
    const sortedQuestions = questionsWithOptions.sort((a, b) => a.order_index - b.order_index);
    
    return {
      ...quiz,
      questions: sortedQuestions
    };
  } catch (error) {
    console.error('Error getting full quiz:', error);
    throw error;
  }
}

// Nộp bài kiểm tra và tính điểm
export async function submitQuiz(submission: QuizSubmission): Promise<QuizResultDetail> {
  try {
    const { quizId, userId, answers, timeSpent } = submission;
    
    // Lấy thông tin đầy đủ của bài kiểm tra
    const fullQuiz = await getFullQuiz(quizId);
    
    // Tính điểm cho từng câu hỏi
    let totalScore = 0;
    let maxScore = 0;
    const questionResults = [];
    
    for (const question of fullQuiz.questions) {
      maxScore += question.points;
      
      // Tìm câu trả lời của người dùng
      const userAnswer = answers.find(a => a.questionId === question.id);
      
      if (!userAnswer) {
        // Người dùng không trả lời câu hỏi này
        questionResults.push({
          questionId: question.id,
          questionText: question.question_text,
          points: question.points,
          earnedPoints: 0,
          isCorrect: false,
          selectedOptions: [],
          correctOptions: question.options
            .filter(o => o.is_correct)
            .map(o => ({
              optionId: o.id,
              optionText: o.option_text
            }))
        });
        continue;
      }
      
      // Lấy các lựa chọn đúng
      const correctOptionIds = question.options
        .filter(o => o.is_correct)
        .map(o => o.id);
      
      // Lấy các lựa chọn của người dùng
      const selectedOptionIds = userAnswer.selectedOptionIds;
      
      // Kiểm tra câu trả lời
      let isCorrect = false;
      let earnedPoints = 0;
      
      if (question.question_type === 'single') {
        // Câu hỏi một lựa chọn
        if (selectedOptionIds.length === 1 && correctOptionIds.includes(selectedOptionIds[0])) {
          isCorrect = true;
          earnedPoints = question.points;
        }
      } else {
        // Câu hỏi nhiều lựa chọn
        // Kiểm tra xem người dùng đã chọn đúng tất cả các lựa chọn đúng và không chọn lựa chọn sai
        const allCorrectSelected = correctOptionIds.every(id => selectedOptionIds.includes(id));
        const noIncorrectSelected = selectedOptionIds.every(id => correctOptionIds.includes(id));
        
        if (allCorrectSelected && noIncorrectSelected) {
          isCorrect = true;
          earnedPoints = question.points;
        } else if (allCorrectSelected || noIncorrectSelected) {
          // Đúng một phần
          earnedPoints = Math.floor(question.points / 2);
        }
      }
      
      totalScore += earnedPoints;
      
      // Thêm kết quả câu hỏi
      questionResults.push({
        questionId: question.id,
        questionText: question.question_text,
        points: question.points,
        earnedPoints,
        isCorrect,
        selectedOptions: selectedOptionIds.map(id => {
          const option = question.options.find(o => o.id === id);
          return {
            optionId: id,
            optionText: option ? option.option_text : '',
            isCorrect: option ? option.is_correct : false
          };
        }),
        correctOptions: question.options
          .filter(o => o.is_correct)
          .map(o => ({
            optionId: o.id,
            optionText: o.option_text
          }))
      });
    }
    
    // Tính điểm phần trăm
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Kiểm tra đạt/không đạt
    const passed = percentage >= fullQuiz.passing_score;
    
    // Lưu kết quả vào cơ sở dữ liệu
    const resultId = await saveQuizResult({
      user_id: userId,
      quiz_id: quizId,
      score: totalScore,
      max_score: maxScore,
      percentage,
      passed,
      time_spent: timeSpent,
      submitted_at: new Date().toISOString(),
      answers_json: JSON.stringify(answers)
    });
    
    // Trả về kết quả chi tiết
    return {
      quizId,
      userId,
      score: totalScore,
      maxScore,
      percentage,
      passed,
      timeSpent,
      submittedAt: new Date().toISOString(),
      questionResults
    };
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
}

// Lấy lịch sử làm bài kiểm tra của người dùng
export async function getUserQuizHistory(userId: number): Promise<QuizResult[]> {
  try {
    const results = await getUserQuizResults(userId);
    return results;
  } catch (error) {
    console.error('Error getting user quiz history:', error);
    throw error;
  }
}

// Tạo bài kiểm tra ngẫu nhiên từ ngân hàng câu hỏi
export async function generateRandomQuiz(
  subjectId: number,
  gradeId: number,
  difficultyLevel: 'basic' | 'intermediate' | 'advanced',
  questionCount: number
): Promise<FullQuiz> {
  try {
    // Lấy danh sách câu hỏi từ ngân hàng câu hỏi
    // Đây là một triển khai giả định, trong thực tế cần truy vấn từ cơ sở dữ liệu
    
    // Tạo bài kiểm tra mới
    const quiz: FullQuiz = {
      id: 0, // ID tạm thời
      title: `Bài kiểm tra ${difficultyLevel === 'basic' ? 'cơ bản' : difficultyLevel === 'intermediate' ? 'trung bình' : 'nâng cao'}`,
      subject_id: subjectId,
      grade_id: gradeId,
      difficulty_level: difficultyLevel,
      quiz_type: 'practice',
      passing_score: 70,
      questions: []
    };
    
    // Trong thực tế, cần lưu bài kiểm tra vào cơ sở dữ liệu và lấy ID thực
    
    return quiz;
  } catch (error) {
    console.error('Error generating random quiz:', error);
    throw error;
  }
}
