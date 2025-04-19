'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import QuizCard from '@/components/ui/QuizCard';
import { useAuth } from '@/lib/auth/AuthContext';

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

interface Subject {
  id: number;
  name: string;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy danh sách môn học
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/subjects');
        
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách môn học');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSubjects(data.subjects);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      }
    }

    // Lấy danh sách bài kiểm tra
    async function fetchQuizzes() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Xây dựng query params
        const params = new URLSearchParams();
        
        if (user?.gradeId) {
          params.append('gradeId', user.gradeId.toString());
        }
        
        if (selectedSubject) {
          params.append('subjectId', selectedSubject.toString());
        }
        
        if (selectedType) {
          params.append('quizType', selectedType);
        }
        
        if (selectedDifficulty) {
          params.append('difficultyLevel', selectedDifficulty);
        }
        
        // Gọi API lấy danh sách bài kiểm tra
        const response = await fetch(`/api/quizzes?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách bài kiểm tra');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setQuizzes(data.quizzes);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubjects();
    fetchQuizzes();
  }, [user, selectedSubject, selectedType, selectedDifficulty]);

  const handleQuizClick = (quizId: number) => {
    router.push(`/quizzes/${quizId}`);
  };

  const handleFilterChange = (
    type: 'subject' | 'type' | 'difficulty',
    value: string | null
  ) => {
    switch (type) {
      case 'subject':
        setSelectedSubject(value ? Number(value) : null);
        break;
      case 'type':
        setSelectedType(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Bài kiểm tra</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subjectFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Môn học
              </label>
              <select
                id="subjectFilter"
                value={selectedSubject || ''}
                onChange={(e) => handleFilterChange('subject', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Loại bài kiểm tra
              </label>
              <select
                id="typeFilter"
                value={selectedType || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả loại</option>
                <option value="practice">Luyện tập</option>
                <option value="midterm">Giữa kỳ</option>
                <option value="final">Cuối kỳ</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="difficultyFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Độ khó
              </label>
              <select
                id="difficultyFilter"
                value={selectedDifficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả độ khó</option>
                <option value="basic">Cơ bản</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải bài kiểm tra...</p>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            Không có bài kiểm tra nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => handleQuizClick(quiz.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
