'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface LessonContent {
  id: number;
  lesson_id: number;
  content_type: 'text' | 'image' | 'video' | 'file';
  content: string;
  order_index: number;
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  grade_id: number;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  order_index: number;
  contents?: LessonContent[];
}

export default function LessonDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Chuyển hướng nếu chưa đăng nhập
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    // Lấy chi tiết bài học
    async function fetchLessonDetails() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API lấy chi tiết bài học
        const response = await fetch(`/api/lessons/${lessonId}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy chi tiết bài học');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setLesson(data.lesson);
          
          // Gọi API để cập nhật tiến trình học tập
          await fetch('/api/progress/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lessonId: Number(lessonId),
              status: 'in_progress'
            }),
          });
          
          // Giả lập tiến trình học tập
          setProgress(30);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching lesson details:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (user && lessonId) {
      fetchLessonDetails();
    }
  }, [user, loading, router, lessonId]);

  const handleCompleteLesson = async () => {
    try {
      setIsLoading(true);
      
      // Gọi API để cập nhật tiến trình học tập
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: Number(lessonId),
          status: 'completed'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật tiến trình học tập');
      }
      
      setProgress(100);
      
      // Hiển thị thông báo hoàn thành
      alert('Chúc mừng! Bạn đã hoàn thành bài học này.');
      
      // Chuyển hướng đến trang bài kiểm tra nếu có
      if (lesson) {
        router.push(`/quizzes?lessonId=${lesson.id}`);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: LessonContent) => {
    switch (content.content_type) {
      case 'text':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
        );
      case 'image':
        return (
          <div className="my-4">
            <img src={content.content} alt="Hình ảnh bài học" className="max-w-full rounded-lg" />
          </div>
        );
      case 'video':
        return (
          <div className="my-4">
            <iframe
              width="100%"
              height="400"
              src={content.content}
              title="Video bài học"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        );
      case 'file':
        return (
          <div className="my-4">
            <a
              href={content.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Tải xuống tài liệu
            </a>
          </div>
        );
      default:
        return null;
    }
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
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại danh sách bài học
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {lesson ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              
              {lesson.description && (
                <p className="text-gray-600 mb-6">{lesson.description}</p>
              )}
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tiến trình học tập</span>
                  <span className="text-sm font-medium text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Nội dung bài học</h2>
                
                {lesson.contents && lesson.contents.length > 0 ? (
                  <div className="space-y-6">
                    {lesson.contents
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((content) => (
                        <div key={content.id} className="border-b border-gray-200 pb-6 last:border-0">
                          {renderContent(content)}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                    Không có nội dung cho bài học này.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleCompleteLesson}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Hoàn thành bài học
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            Không tìm thấy bài học.
          </div>
        )}
      </div>
    </Layout>
  );
}
