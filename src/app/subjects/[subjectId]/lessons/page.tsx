'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import LessonCard from '@/components/ui/LessonCard';
import { useAuth } from '@/lib/auth/AuthContext';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  order_index: number;
}

interface Subject {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
}

export default function LessonsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chuyển hướng nếu chưa đăng nhập
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    // Lấy thông tin môn học và danh sách bài học
    async function fetchLessons() {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy lớp của người dùng
        const gradeId = user?.gradeId;
        
        if (!gradeId) {
          throw new Error('Bạn chưa chọn lớp. Vui lòng cập nhật thông tin cá nhân.');
        }
        
        // Gọi API lấy thông tin môn học
        const subjectResponse = await fetch(`/api/subjects/${subjectId}`);
        
        if (!subjectResponse.ok) {
          throw new Error('Không thể lấy thông tin môn học');
        }
        
        const subjectData = await subjectResponse.json();
        
        if (subjectData.success) {
          setSubject(subjectData.subject);
        } else {
          throw new Error(subjectData.error || 'Lỗi không xác định');
        }
        
        // Gọi API lấy danh sách bài học
        const lessonsResponse = await fetch(`/api/lessons?subjectId=${subjectId}&gradeId=${gradeId}`);
        
        if (!lessonsResponse.ok) {
          throw new Error('Không thể lấy danh sách bài học');
        }
        
        const lessonsData = await lessonsResponse.json();
        
        if (lessonsData.success) {
          // Sắp xếp bài học theo thứ tự
          const sortedLessons = lessonsData.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index);
          setLessons(sortedLessons);
        } else {
          throw new Error(lessonsData.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (user && subjectId) {
      fetchLessons();
    }
  }, [user, loading, router, subjectId]);

  const handleLessonClick = (lessonId: number) => {
    router.push(`/lessons/${lessonId}`);
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
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
            onClick={() => router.push('/subjects')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại danh sách môn học
          </button>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {subject ? subject.name : 'Bài học'}
        </h1>
        
        {subject?.description && (
          <p className="text-gray-600 mb-8">{subject.description}</p>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {lessons.length === 0 && !error ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            Không có bài học nào cho môn học này ở lớp của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => handleLessonClick(lesson.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
