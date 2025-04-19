'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth/AuthContext';

interface SubjectBreakdown {
  subjectId: number;
  subjectName: string;
  studyTime: number;
  completedLessons: number;
  completedQuizzes: number;
  averageScore: number;
}

interface WeeklyActivity {
  date: string;
  studyTime: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
}

interface ProgressReport {
  userId: number;
  period: 'week' | 'month' | 'semester' | 'year';
  startDate: string;
  endDate: string;
  totalStudyTime: number;
  completedLessons: number;
  completedQuizzes: number;
  averageScore: number;
  subjectBreakdown: SubjectBreakdown[];
  weeklyActivity: WeeklyActivity[];
}

export default function ProgressReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period') as 'week' | 'month' | 'semester' | 'year' || 'week';
  
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy báo cáo tiến trình học tập
    async function fetchProgressReport() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/progress/report?period=${period}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy báo cáo tiến trình học tập');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setReport(data.report);
        } else {
          throw new Error(data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Error fetching progress report:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchProgressReport();
    }
  }, [user, period]);

  // Định dạng thời gian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Định dạng thời gian học tập (phút)
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    
    return `${mins} phút`;
  };

  // Lấy tiêu đề báo cáo theo khoảng thời gian
  const getReportTitle = () => {
    switch (period) {
      case 'week':
        return 'Báo cáo tuần';
      case 'month':
        return 'Báo cáo tháng';
      case 'semester':
        return 'Báo cáo học kỳ';
      case 'year':
        return 'Báo cáo năm';
      default:
        return 'Báo cáo tiến trình';
    }
  };

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'semester' | 'year') => {
    router.push(`/progress/report?period=${newPeriod}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải báo cáo tiến trình...</p>
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
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{getReportTitle()}</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1 rounded-md ${
                period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1 rounded-md ${
                period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => handlePeriodChange('semester')}
              className={`px-3 py-1 rounded-md ${
                period === 'semester' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Học kỳ
            </button>
            <button
              onClick={() => handlePeriodChange('year')}
              className={`px-3 py-1 rounded-md ${
                period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Năm
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {report ? (
          <div className="space-y-8">
            {/* Thông tin báo cáo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin báo cáo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Khoảng thời gian</div>
                  <div className="font-medium">
                    {formatDate(report.startDate)} - {formatDate(report.endDate)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Tổng thời gian học tập</div>
                  <div className="font-medium">
                    {formatStudyTime(report.totalStudyTime)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Bài học đã hoàn thành</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {report.completedLessons}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Bài kiểm tra đã làm</div>
                  <div className="text-2xl font-bold text-green-600">
                    {report.completedQuizzes}
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Điểm trung bình</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {report.averageScore}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hoạt động theo tuần */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Hoạt động theo tuần</h2>
              
              {report.weeklyActivity.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                  Không có dữ liệu hoạt động trong khoảng thời gian này.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian học tập
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bài học hoàn thành
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bài kiểm tra hoàn thành
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.weeklyActivity.map((activity, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatDate(activity.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatStudyTime(activity.studyTime)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{activity.lessonsCompleted}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{activity.quizzesCompleted}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Phân tích theo môn học */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Phân tích theo môn học</h2>
              
              {report.subjectBreakdown.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                  Không có dữ liệu môn học trong khoảng thời gian này.
                </div>
              ) : (
                <div className="space-y-6">
                  {report.subjectBreakdown.map((subject) => (
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Thời gian học tập</div>
                          <div className="font-medium">
                            {formatStudyTime(subject.studyTime)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Bài học hoàn thành</div>
                          <div className="font-medium">
                            {subject.completedLessons}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Bài kiểm tra hoàn thành</div>
                          <div className="font-medium">
                            {subject.completedQuizzes}
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
                          style={{ width: `${Math.round((subject.studyTime / report.totalStudyTime) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {Math.round((subject.studyTime / report.totalStudyTime) * 100)}% thời gian học tập
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Các nút hành động */}
            <div className="flex justify-between">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Quay lại bảng điều khiển
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                In báo cáo
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
            Không có dữ liệu báo cáo tiến trình học tập.
            
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
