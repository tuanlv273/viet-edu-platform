'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function AIAnalysisPage() {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Danh sách học sinh mẫu
  const students = [
    { id: '1', name: 'Nguyễn Văn A - Lớp 5' },
    { id: '2', name: 'Trần Thị B - Lớp 7' },
    { id: '3', name: 'Lê Minh C - Lớp 9' },
    { id: '4', name: 'Phạm Hoàng D - Lớp 3' },
  ];

  // Danh sách môn học
  const subjects = [
    { id: 'all', name: 'Tất cả các môn' },
    { id: 'math', name: 'Toán học' },
    { id: 'english', name: 'Tiếng Anh' },
    { id: 'physics', name: 'Vật lý' },
    { id: 'chemistry', name: 'Hóa học' },
    { id: 'informatics', name: 'Tin học' }
  ];

  // Xử lý phân tích
  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Mô phỏng API call để phân tích dữ liệu học tập
      // Trong triển khai thực tế, đây sẽ là một API call đến backend
      // để gọi OpenAI hoặc Google AI API
      
      // Mô phỏng thời gian chờ để phân tích
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mô phỏng kết quả phân tích
      const result = generateMockAnalysis();
      
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error analyzing learning data:', err);
      setError('Đã xảy ra lỗi khi phân tích dữ liệu học tập. Vui lòng thử lại sau.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mô phỏng kết quả phân tích
  const generateMockAnalysis = () => {
    const studentName = students.find(s => s.id === selectedStudent)?.name || 'học sinh';
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'tất cả các môn';
    const timeRangeText = 
      timeRange === 'week' ? 'tuần qua' : 
      timeRange === 'month' ? 'tháng qua' : 
      timeRange === 'semester' ? 'học kỳ này' : 'năm học này';
    
    return `# Báo cáo phân tích học tập của ${studentName}

## Tổng quan
Báo cáo này phân tích dữ liệu học tập của học sinh trong ${timeRangeText} cho ${subjectName}.

## Điểm mạnh
- **Sự tham gia tích cực**: Học sinh hoàn thành 85% bài học và bài kiểm tra đúng hạn.
- **Kỹ năng giải quyết vấn đề**: Thể hiện khả năng tốt trong các bài tập yêu cầu tư duy phân tích.
- **Tiến bộ đều đặn**: Điểm số có xu hướng tăng dần qua thời gian, đặc biệt trong các bài kiểm tra gần đây.

## Điểm yếu
- **Khó khăn với một số chủ đề**: Học sinh gặp khó khăn với chủ đề [X] và [Y].
- **Thời gian hoàn thành**: Một số bài kiểm tra mất nhiều thời gian hơn mức trung bình.
- **Tính nhất quán**: Kết quả học tập có sự dao động giữa các bài kiểm tra.

## Phân tích chi tiết theo môn học

### Toán học
- Điểm trung bình: 8.5/10
- Chủ đề mạnh: Đại số, Hình học
- Chủ đề yếu: Xác suất thống kê
- Xu hướng: ↗️ Tăng 0.5 điểm so với kỳ trước

### Tiếng Anh
- Điểm trung bình: 7.8/10
- Chủ đề mạnh: Đọc hiểu, Từ vựng
- Chủ đề yếu: Ngữ pháp phức tạp
- Xu hướng: → Ổn định

### Vật lý
- Điểm trung bình: 8.2/10
- Chủ đề mạnh: Cơ học, Nhiệt học
- Chủ đề yếu: Điện từ học
- Xu hướng: ↗️ Tăng 0.3 điểm so với kỳ trước

## Đề xuất cải thiện

1. **Tăng cường học tập các chủ đề yếu**:
   - Xác suất thống kê (Toán học)
   - Ngữ pháp phức tạp (Tiếng Anh)
   - Điện từ học (Vật lý)

2. **Phương pháp học tập đề xuất**:
   - Sử dụng phương pháp học tập chủ động
   - Tăng cường thực hành với các bài tập đa dạng
   - Áp dụng kỹ thuật ôn tập ngắt quãng (spaced repetition)

3. **Lộ trình học tập cá nhân hóa**:
   - Tuần 1-2: Tập trung vào chủ đề [X]
   - Tuần 3-4: Tập trung vào chủ đề [Y]
   - Tuần 5-6: Ôn tập tổng hợp và đánh giá tiến bộ

## Dự đoán kết quả

Dựa trên dữ liệu hiện tại và mô hình dự đoán của chúng tôi, nếu học sinh tuân theo các đề xuất trên, dự kiến:
- Điểm trung bình có thể tăng 0.5-1.0 điểm trong kỳ tới
- Khả năng đạt thành tích cao trong kỳ thi cuối năm: 85%
- Các chủ đề yếu sẽ được cải thiện đáng kể trong vòng 2-3 tháng

## Kết luận

Học sinh đang có tiến bộ tốt và có tiềm năng phát triển hơn nữa. Việc tập trung vào các điểm yếu đã xác định và tuân theo lộ trình học tập được đề xuất sẽ giúp học sinh đạt được kết quả tốt hơn trong thời gian tới.`;
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Phân tích và đánh giá học tập bằng AI</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel điều khiển */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Cấu hình phân tích</h2>
              
              {/* Chọn học sinh */}
              <div>
                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                  Học sinh
                </label>
                <select
                  id="student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Chọn học sinh</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Chọn môn học */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Môn học
                </label>
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Chọn khoảng thời gian */}
              <div>
                <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng thời gian
                </label>
                <select
                  id="timeRange"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Tuần qua</option>
                  <option value="month">Tháng qua</option>
                  <option value="semester">Học kỳ này</option>
                  <option value="year">Năm học này</option>
                </select>
              </div>
              
              {/* Nút phân tích */}
              <div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedStudent}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Đang phân tích...' : 'Phân tích dữ liệu học tập'}
                </button>
              </div>
              
              {/* Liên kết đến trang sinh nội dung */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Công cụ AI khác:</p>
                <Link href="/ai-integration" className="text-blue-600 hover:underline block mb-2">
                  → Sinh nội dung học tập bằng AI
                </Link>
                <Link href="/dashboard" className="text-blue-600 hover:underline block">
                  → Xem bảng điều khiển học tập
                </Link>
              </div>
            </div>
          </div>
          
          {/* Khu vực hiển thị kết quả phân tích */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kết quả phân tích</h2>
                
                {analysisResult && (
                  <button
                    onClick={() => alert('Đã lưu báo cáo phân tích!')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Lưu báo cáo
                  </button>
                )}
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {isAnalyzing ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang phân tích dữ liệu học tập...</p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
                    {analysisResult}
                  </pre>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  Chọn học sinh và nhấn "Phân tích dữ liệu học tập" để xem báo cáo phân tích
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
