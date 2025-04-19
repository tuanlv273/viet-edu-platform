'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface LessonProgress {
  lessonId: number;
  lessonTitle: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  lastAccessed: string | null;
}

interface QuizResult {
  quizId: number;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  gradeId: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lessonProgress: LessonProgress[];
  quizResults: QuizResult[];
}

export default function SubjectProgressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const gradeId = searchParams.get('gradeId');
  
  const [progress, setProgress] = useState<SubjectProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy tiến trình học tập chi tiết của môn học
    async function fetchSubjectProgress() {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!subjectId || !gradeId) {
          throw new Error('Thiếu thông tin môn học hoặc lớp');
        }
        
        const response = await fetch(`/api/progress/subject?subjectId=${subjectId}&gradeId=${gradeId}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy tiến trình học tập của môn học');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProgress(data.progress);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching subject progress:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchSubjectProgress();
    }
  }, [user, subjectId, gradeId]);

  // Định dạng thời gian
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Lấy màu sắc cho trạng thái bài học
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Lấy tên trạng thái bài học
  const getStatusName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'in_progress':
        return 'Đang học';
      default:
        return 'Chưa bắt đầu';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải tiến trình học tập...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại bảng điều khiển
          </button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">
          {progress ? `Tiến trình học tập: ${progress.subjectName}` : 'Tiến trình học tập'}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {progress ? (
          <div className="space-y-8">
            {/* Tổng quan tiến trình môn học */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Tổng quan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Bài học đã hoàn thành</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.completedLessons}/{progress.totalLessons}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {Math.round((progress.completedLessons / progress.totalLessons) * 100) || 0}% hoàn thành
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Bài kiểm tra đã làm</div>
                  <div className="text-2xl font-bold text-green-600">
                    {progress.completedQuizzes}/{progress.totalQuizzes}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {Math.round((progress.completedQuizzes / progress.totalQuizzes) * 100) || 0}% hoàn thành
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Điểm trung bình</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {progress.averageScore}%
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {progress.averageScore >= 80 ? 'Xuất sắc' : 
                     progress.averageScore >= 70 ? 'Tốt' : 
                     progress.averageScore >= 60 ? 'Khá' : 
                     progress.averageScore >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Tiến độ tổng thể</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(((progress.completedLessons + progress.completedQuizzes) / 
                      (progress.totalLessons + progress.totalQuizzes)) * 100) || 0}%
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {progress.completedLessons + progress.completedQuizzes}/{progress.totalLessons + progress.totalQuizzes} hoạt động
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.round(((progress.completedLessons + progress.completedQuizzes) / 
                    (progress.totalLessons + progress.totalQuizzes)) * 100) || 0}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 text-right">
                Tiến độ tổng thể
              </div>
            </div>
            
            {/* Tiến trình bài học */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Tiến trình bài học</h2>
              
              {progress.lessonProgress.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                  Không có bài học nào cho môn học này.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bài học
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Truy cập gần nhất
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {progress.lessonProgress.map((lesson) => (
                        <tr key={lesson.lessonId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{lesson.lessonTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                              {getStatusName(lesson.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${lesson.completionPercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {lesson.completionPercentage}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(lesson.lastAccessed)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => router.push(`/lessons/${lesson.lessonId}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {lesson.status === 'completed' ? 'Xem lại' : 'Tiếp tục học'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Kết quả bài kiểm tra */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Kết quả bài kiểm tra</h2>
              
              {progress.quizResults.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                  Bạn chưa làm bài kiểm tra nào cho môn học này.
                  
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/quizzes?subjectId=${progress.subjectId}&gradeId=${progress.gradeId}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Làm bài kiểm tra
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bài kiểm tra
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm số
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kết quả
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày làm bài
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {progress.quizResults.map((quiz) => (
                        <tr key={quiz.quizId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{quiz.quizTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {quiz.score}/{quiz.maxScore} ({quiz.percentage}%)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              quiz.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {quiz.passed ? 'Đạt' : 'Chưa đạt'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(quiz.submittedAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => router.push(`/quizzes/${quiz.quizId}/result`)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Xem kết quả
                            </button>
                            <button
                              onClick={() => router.push(`/quizzes/${quiz.quizId}`)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Làm lại
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Các nút hành động */}
            <div className="flex justify-between">
              <button
                onClick={() => router.push(`/subjects/${progress.subjectId}/lessons`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Xem tất cả bài học
              </button>
              
              <button
                onClick={() => router.push(`/quizzes?subjectId=${progress.subjectId}&gradeId=${progress.gradeId}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Xem tất cả bài kiểm tra
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
            Không có dữ liệu tiến trình học tập cho môn học này.
            
            <div className="mt-4">
              <button
                onClick={() => router.push('/subjects')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Khám phá các môn học
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
