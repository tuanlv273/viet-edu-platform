// src/app/subjects/page.tsx
// Trang hiển thị danh sách môn học

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import SubjectCard from '@/components/ui/SubjectCard';
import { useAuth } from '@/lib/auth/AuthContext';

interface Subject {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
}

export default function SubjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chuyển hướng nếu chưa đăng nhập
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    // Lấy danh sách môn học
    async function fetchSubjects() {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy lớp của người dùng
        const gradeId = user?.gradeId;
        
        // Gọi API lấy danh sách môn học theo lớp
        const response = await fetch(`/api/subjects${gradeId ? `?gradeId=${gradeId}` : ''}`);
        
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
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchSubjects();
    }
  }, [user, loading, router]);

  const handleSubjectClick = (subjectId: number) => {
    router.push(`/subjects/${subjectId}/lessons`);
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
        <h1 className="text-3xl font-bold mb-8">Danh sách môn học</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {subjects.length === 0 && !error ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            Không có môn học nào cho lớp của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onClick={() => handleSubjectClick(subject.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
