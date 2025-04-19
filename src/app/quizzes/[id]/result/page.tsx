'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface QuestionResult {
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
}

interface QuizResult {
  quizId: number;
  userId: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  submittedAt: string;
  questionResults: QuestionResult[];
}

export default function QuizResultPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const resultId = searchParams.get('resultId');
  
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizResult() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API lấy kết quả bài kiểm tra
        const response = await fetch(`/api/quizzes/${quizId}/results${resultId ? `?resultId=${resultId}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy kết quả bài kiểm tra');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResult(data.result);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching quiz result:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      fetchQuizResult();
    }
  }, [quizId, resultId]);

  // Định dạng thời gian
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds} giây`;
  };

  // Định dạng thời gian nộp bài
  const formatSubmitTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải kết quả...</p>
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

  if (!result) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
            Không tìm thấy kết quả bài kiểm tra.
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

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Kết quả bài kiểm tra</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-medium mb-2">Điểm số</div>
                <div className="text-3xl font-bold text-blue-600">
                  {result.score}/{result.maxScore} ({result.percentage}%)
                </div>
                <div className={`mt-2 text-sm font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.passed ? 'Đạt' : 'Chưa đạt'}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-medium mb-2">Thông tin</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian làm bài:</span>
                    <span className="font-medium">{formatTime(result.timeSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian nộp bài:</span>
                    <span className="font-medium">{formatSubmitTime(result.submittedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số câu đúng:</span>
                    <span className="font-medium">
                      {result.questionResults.filter(q => q.isCorrect).length}/{result.questionResults.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Chi tiết câu trả lời</h2>
              
              <div className="space-y-6">
                {result.questionResults.map((question, index) => (
                  <div key={question.questionId} className="border rounded-lg overflow-hidden">
                    <div className={`p-4 ${question.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">
                          Câu {index + 1}: {question.questionText}
                        </h3>
                        <div className={`font-medium ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {question.earnedPoints}/{question.points} điểm
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-2 font-medium">Đáp án của bạn:</div>
                      <div className="space-y-2">
                        {question.selectedOptions.length > 0 ? (
                          question.selectedOptions.map(option => (
                            <div 
                              key={option.optionId}
                              className={`p-3 rounded-lg ${
                                option.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {option.optionText}
                              {option.isCorrect ? (
                                <span className="ml-2">✓</span>
                              ) : (
                                <span className="ml-2">✗</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">Không có đáp án được chọn</div>
                        )}
                      </div>
                      
                      {!question.isCorrect && (
                        <div className="mt-4">
                          <div className="mb-2 font-medium">Đáp án đúng:</div>
                          <div className="space-y-2">
                            {question.correctOptions.map(option => (
                              <div 
                                key={option.optionId}
                                className="p-3 rounded-lg bg-green-100 text-green-800"
                              >
                                {option.optionText}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => router.push('/quizzes')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Quay lại danh sách bài kiểm tra
              </button>
              
              <button
                onClick={() => router.push(`/quizzes/${quizId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Làm lại bài kiểm tra
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
