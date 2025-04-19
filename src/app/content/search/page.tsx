'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';
import LessonCard from '@/components/ui/LessonCard';
import QuizCard from '@/components/ui/QuizCard';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  order_index: number;
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
}

export default function ContentSearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Gọi API tìm kiếm nội dung
      const response = await fetch(`/api/content/search?query=${encodeURIComponent(query)}${user?.gradeId ? `&gradeId=${user.gradeId}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Không thể tìm kiếm nội dung');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setLessons(data.lessons || []);
        setQuizzes(data.quizzes || []);
        setHasSearched(true);
      } else {
        throw new Error(data.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error('Error searching content:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonClick = (lessonId: number) => {
    router.push(`/lessons/${lessonId}`);
  };

  const handleQuizClick = (quizId: number) => {
    router.push(`/quizzes/${quizId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Tìm kiếm nội dung học tập</h1>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium transition-colors ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
            </button>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {hasSearched && (
          <div>
            {lessons.length === 0 && quizzes.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                Không tìm thấy kết quả nào cho từ khóa "{query}".
              </div>
            ) : (
              <div className="space-y-8">
                {lessons.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Bài học ({lessons.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {lessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          onClick={() => handleLessonClick(lesson.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {quizzes.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Bài kiểm tra ({quizzes.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes.map((quiz) => (
                        <QuizCard
                          key={quiz.id}
                          quiz={quiz}
                          onClick={() => handleQuizClick(quiz.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
