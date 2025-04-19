'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
}

interface UserProgress {
  userId: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lastActivity: string;
  subjectProgress: SubjectProgress[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy tiến trình học tập của người dùng
    async function fetchUserProgress() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/progress/user');
        
        if (!response.ok) {
          throw new Error('Không thể lấy tiến trình học tập');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProgress(data.progress);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching user progress:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  // Định dạng thời gian hoạt động gần nhất
  const formatLastActivity = (dateString: string) => {
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
        <h1 className="text-3xl font-bold mb-8">Bảng điều khiển</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {progress ? (
          <div className="space-y-8">
            {/* Tổng quan tiến trình */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Tổng quan tiến trình học tập</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="text-sm font-medium text-gray-500 mb-1">Hoạt động gần nhất</div>
                  <div className="text-lg font-bold text-yellow-600">
                    {formatLastActivity(progress.lastActivity)}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <button 
                      onClick={() => router.push('/progress/report?period=week')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Xem báo cáo hoạt động
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tiến trình theo môn học */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Tiến trình theo môn học</h2>
              
              {progress.subjectProgress.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                  Bạn chưa bắt đầu học bất kỳ môn học nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.subjectProgress.map((subject) => (
                    <div key={subject.subjectId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{subject.subjectName}</h3>
                        <button
                          onClick={() => router.push(`/progress/subject?subjectId=${subject.subjectId}&gradeId=${user?.gradeId}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Bài học</div>
                          <div className="font-medium">
                            {subject.completedLessons}/{subject.totalLessons}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Bài kiểm tra</div>
                          <div className="font-medium">
                            {subject.completedQuizzes}/{subject.totalQuizzes}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Điểm trung bình</div>
                          <div className="font-medium">
                            {subject.averageScore}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.round((subject.completedLessons / subject.totalLessons) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => router.push('/subjects')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Khám phá các môn học
                </button>
              </div>
            </div>
            
            {/* Các nút hành động */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/progress/report?period=week')}
                className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium mb-1">Báo cáo tiến trình</h3>
                <p className="text-sm text-gray-500">Xem báo cáo chi tiết về tiến trình học tập của bạn</p>
              </button>
              
              <button
                onClick={() => router.push('/quizzes')}
                className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium mb-1">Bài kiểm tra</h3>
                <p className="text-sm text-gray-500">Làm bài kiểm tra để đánh giá kiến thức của bạn</p>
              </button>
              
              <button
                onClick={() => router.push('/content/search')}
                className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium mb-1">Tìm kiếm nội dung</h3>
                <p className="text-sm text-gray-500">Tìm kiếm bài học và tài liệu học tập</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
            Không có dữ liệu tiến trình học tập. Hãy bắt đầu học để theo dõi tiến trình của bạn.
            
            <div className="mt-4">
              <button
                onClick={() => router.push('/subjects')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Bắt đầu học ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
