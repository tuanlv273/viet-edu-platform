'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface LessonRecommendation {
  lessonId: number;
  lessonTitle: string;
  subjectId: number;
  subjectName: string;
  gradeId: number;
  difficulty: string;
  relevanceScore: number;
  reason: string;
}

interface QuizRecommendation {
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

interface LearningPathSubject {
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
}

interface LearningPath {
  userId: number;
  gradeId: number;
  generatedAt: string;
  expiresAt: string;
  subjects: LearningPathSubject[];
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [lessonRecommendations, setLessonRecommendations] = useState<LessonRecommendation[]>([]);
  const [quizRecommendations, setQuizRecommendations] = useState<QuizRecommendation[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes' | 'path'>('path');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy đề xuất bài học, bài kiểm tra và lộ trình học tập
    async function fetchRecommendations() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Lấy lộ trình học tập
        const pathResponse = await fetch('/api/recommendations/learning-path');
        
        if (!pathResponse.ok) {
          throw new Error('Không thể lấy lộ trình học tập');
        }
        
        const pathData = await pathResponse.json();
        
        if (pathData.success) {
          setLearningPath(pathData.learningPath);
        }
        
        // Lấy đề xuất bài học
        const lessonResponse = await fetch('/api/recommendations/lessons');
        
        if (!lessonResponse.ok) {
          throw new Error('Không thể lấy đề xuất bài học');
        }
        
        const lessonData = await lessonResponse.json();
        
        if (lessonData.success) {
          setLessonRecommendations(lessonData.recommendations);
        }
        
        // Lấy đề xuất bài kiểm tra
        const quizResponse = await fetch('/api/recommendations/quizzes');
        
        if (!quizResponse.ok) {
          throw new Error('Không thể lấy đề xuất bài kiểm tra');
        }
        
        const quizData = await quizResponse.json();
        
        if (quizData.success) {
          setQuizRecommendations(quizData.recommendations);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  // Định dạng thời gian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Lấy màu sắc cho độ khó
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Lấy tên độ khó
  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return 'Không xác định';
    }
  };

  // Lấy tên loại bài kiểm tra
  const getQuizTypeName = (quizType: string) => {
    switch (quizType) {
      case 'practice':
        return 'Luyện tập';
      case 'midterm':
        return 'Giữa kỳ';
      case 'final':
        return 'Cuối kỳ';
      default:
        return 'Không xác định';
    }
  };

  // Lấy màu sắc cho loại bài kiểm tra
  const getQuizTypeColor = (quizType: string) => {
    switch (quizType) {
      case 'practice':
        return 'bg-blue-100 text-blue-800';
      case 'midterm':
        return 'bg-purple-100 text-purple-800';
      case 'final':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải đề xuất học tập...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Đề xuất học tập</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-8">
          <button
            onClick={() => setActiveTab('path')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'path'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lộ trình học tập
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'lessons'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bài học đề xuất
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'quizzes'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bài kiểm tra đề xuất
          </button>
        </div>
        
        {/* Lộ trình học tập */}
        {activeTab === 'path' && (
          <div>
            {learningPath ? (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Lộ trình học tập cá nhân hóa</h2>
                    <div className="text-sm text-gray-500">
                      Tạo ngày {formatDate(learningPath.generatedAt)} - Hết hạn {formatDate(learningPath.expiresAt)}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Lộ trình học tập này được tạo riêng cho bạn dựa trên tiến trình học tập của bạn. 
                    Hãy làm theo lộ trình này để đạt kết quả học tập tốt nhất.
                  </p>
                  
                  {learningPath.subjects.length === 0 ? (
                    <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                      Không có môn học nào trong lộ trình học tập.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {learningPath.subjects.map((subject) => (
                        <div key={subject.subjectId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-lg">{subject.subjectName}</h3>
                            <div className="flex items-center">
                              <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${subject.completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {Math.round(subject.completionPercentage)}% hoàn thành
                              </span>
                            </div>
                          </div>
                          
                          {/* Bài học đề xuất */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Bài học đề xuất</h4>
                            {subject.recommendedLessons.length === 0 ? (
                              <div className="text-sm text-gray-500">Không có bài học đề xuất.</div>
                            ) : (
                              <div className="space-y-2">
                                {subject.recommendedLessons.map((lesson) => (
                                  <div key={lesson.lessonId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <div className="font-medium">{lesson.order}. {lesson.lessonTitle}</div>
                                      <div className="text-sm text-gray-500">
                                        Thời gian ước tính: {lesson.estimatedTimeMinutes} phút
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => router.push(`/lessons/${lesson.lessonId}`)}
                                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                      Học ngay
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Bài kiểm tra đề xuất */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Bài kiểm tra đề xuất</h4>
                            {subject.recommendedQuizzes.length === 0 ? (
                              <div className="text-sm text-gray-500">Không có bài kiểm tra đề xuất.</div>
                            ) : (
                              <div className="space-y-2">
                                {subject.recommendedQuizzes.map((quiz) => (
                                  <div key={quiz.quizId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <div className="font-medium">{quiz.order}. {quiz.quizTitle}</div>
                                      <div className="flex space-x-2 text-xs mt-1">
                                        <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                                          {getDifficultyName(quiz.difficulty)}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full ${getQuizTypeColor(quiz.quizType)}`}>
                                          {getQuizTypeName(quiz.quizType)}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => router.push(`/quizzes/${quiz.quizId}`)}
                                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                      Làm bài
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Xem tiến trình học tập
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
                Không có dữ liệu lộ trình học tập.
                
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
        )}
        
        {/* Bài học đề xuất */}
        {activeTab === 'lessons' && (
          <div>
            {lessonRecommendations.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
                Không có đề xuất bài học nào.
                
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/subjects')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Khám phá các môn học
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonRecommendations.map((recommendation) => (
                  <div key={recommendation.lessonId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{recommendation.lessonTitle}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(recommendation.difficulty)}`}>
                          {getDifficultyName(recommendation.difficulty)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {recommendation.subjectName}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Lý do đề xuất:</strong> {recommendation.reason}
                      </div>
                      
                      <button
                        onClick={() => router.push(`/lessons/${recommendation.lessonId}`)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Học ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Bài kiểm tra đề xuất */}
        {activeTab === 'quizzes' && (
          <div>
            {quizRecommendations.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
                Không có đề xuất bài kiểm tra nào.
                
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/quizzes')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Xem tất cả bài kiểm tra
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizRecommendations.map((recommendation) => (
                  <div key={recommendation.quizId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{recommendation.quizTitle}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(recommendation.difficulty)}`}>
                          {getDifficultyName(recommendation.difficulty)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {recommendation.subjectName}
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getQuizTypeColor(recommendation.quizType)}`}>
                          {getQuizTypeName(recommendation.quizType)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Lý do đề xuất:</strong> {recommendation.reason}
                      </div>
                      
                      <button
                        onClick={() => router.push(`/quizzes/${recommendation.quizId}`)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Làm bài
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
