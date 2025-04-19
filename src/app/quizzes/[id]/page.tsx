'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  order_index: number;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'single' | 'multiple';
  points: number;
  order_index: number;
  options: QuizOption[];
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  lesson_id?: number;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  quiz_type: 'practice' | 'midterm' | 'final';
  time_limit?: number;
  passing_score: number;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy thông tin bài kiểm tra
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/quizzes/${quizId}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin bài kiểm tra');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setQuiz(data.quiz);
          
          // Khởi tạo selectedOptions
          const initialSelectedOptions: Record<number, number[]> = {};
          data.quiz.questions.forEach((question: QuizQuestion) => {
            initialSelectedOptions[question.id] = [];
          });
          setSelectedOptions(initialSelectedOptions);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  // Đếm thời gian làm bài
  useEffect(() => {
    if (!quiz || isLoading) return;
    
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quiz, isLoading]);

  // Xử lý chọn đáp án
  const handleOptionSelect = (questionId: number, optionId: number, questionType: 'single' | 'multiple') => {
    setSelectedOptions(prev => {
      const newSelectedOptions = { ...prev };
      
      if (questionType === 'single') {
        // Đối với câu hỏi một lựa chọn, chỉ chọn một đáp án
        newSelectedOptions[questionId] = [optionId];
      } else {
        // Đối với câu hỏi nhiều lựa chọn, có thể chọn nhiều đáp án
        const currentSelected = newSelectedOptions[questionId] || [];
        
        if (currentSelected.includes(optionId)) {
          // Nếu đã chọn, bỏ chọn
          newSelectedOptions[questionId] = currentSelected.filter(id => id !== optionId);
        } else {
          // Nếu chưa chọn, thêm vào
          newSelectedOptions[questionId] = [...currentSelected, optionId];
        }
      }
      
      return newSelectedOptions;
    });
  };

  // Chuyển đến câu hỏi tiếp theo
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Chuyển đến câu hỏi trước đó
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Nộp bài kiểm tra
  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;
    
    try {
      setIsSubmitting(true);
      
      // Chuyển đổi selectedOptions thành mảng answers
      const answers = Object.entries(selectedOptions).map(([questionId, optionIds]) => ({
        questionId: Number(questionId),
        selectedOptionIds: optionIds
      }));
      
      // Gọi API nộp bài kiểm tra
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          timeSpent
        }),
      });
      
      if (!response.ok) {
        throw new Error('Không thể nộp bài kiểm tra');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Chuyển hướng đến trang kết quả
        router.push(`/quizzes/${quiz.id}/result?resultId=${data.result.resultId || 'latest'}`);
      } else {
        throw new Error(data.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setIsSubmitting(false);
    }
  };

  // Hiển thị thời gian làm bài
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải bài kiểm tra...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
            Không tìm thấy bài kiểm tra.
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </Layout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <div className="text-lg font-medium">
                Thời gian: {formatTime(timeSpent)}
                {quiz.time_limit && <span className="text-gray-500"> / {quiz.time_limit}:00</span>}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Câu hỏi {currentQuestionIndex + 1}/{quiz.questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  Điểm: {currentQuestion.points}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOptions[currentQuestion.id]?.includes(option.id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id, currentQuestion.question_type)}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                        selectedOptions[currentQuestion.id]?.includes(option.id)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {currentQuestion.question_type === 'single' ? (
                          <span className="text-sm">
                            {selectedOptions[currentQuestion.id]?.includes(option.id) ? '✓' : ''}
                          </span>
                        ) : (
                          <span className="text-sm">
                            {selectedOptions[currentQuestion.id]?.includes(option.id) ? '✓' : ''}
                          </span>
                        )}
                      </div>
                      <span className="ml-3">{option.option_text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Câu trước
              </button>
              
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Câu tiếp theo
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-green-600 text-white rounded-md font-medium ${
                    isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Danh sách câu hỏi</h2>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : selectedOptions[question.id]?.length
                      ? 'bg-green-100 text-green-800 border border-green-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
