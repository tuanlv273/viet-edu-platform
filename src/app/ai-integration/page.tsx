'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';

export default function AIIntegrationPage() {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'googleai'>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [contentType, setContentType] = useState<'lesson' | 'quiz'>('lesson');
  const [subject, setSubject] = useState<string>('math');
  const [grade, setGrade] = useState<string>('1');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Danh sách model của OpenAI
  const openAIModels = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];

  // Danh sách model của Google AI
  const googleAIModels = [
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'gemini-ultra', name: 'Gemini Ultra' },
    { id: 'palm-2', name: 'PaLM 2' }
  ];

  // Danh sách môn học
  const subjects = [
    { id: 'math', name: 'Toán học' },
    { id: 'english', name: 'Tiếng Anh' },
    { id: 'physics', name: 'Vật lý' },
    { id: 'chemistry', name: 'Hóa học' },
    { id: 'informatics', name: 'Tin học' }
  ];

  // Danh sách lớp
  const grades = Array.from({ length: 9 }, (_, i) => ({
    id: String(i + 1),
    name: `Lớp ${i + 1}`
  }));

  // Cập nhật danh sách model khi thay đổi nhà cung cấp
  useEffect(() => {
    if (selectedProvider === 'openai') {
      setSelectedModel(openAIModels[0].id);
    } else {
      setSelectedModel(googleAIModels[0].id);
    }
  }, [selectedProvider]);

  // Xử lý sinh nội dung
  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Mô phỏng API call để sinh nội dung
      // Trong triển khai thực tế, đây sẽ là một API call đến backend
      // để gọi OpenAI hoặc Google AI API
      
      // Tạo prompt dựa trên các tham số đã chọn
      const prompt = createPrompt();
      
      // Mô phỏng thời gian chờ để sinh nội dung
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mô phỏng nội dung được sinh ra
      const content = generateMockContent();
      
      setGeneratedContent(content);
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Đã xảy ra lỗi khi sinh nội dung. Vui lòng thử lại sau.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Tạo prompt dựa trên các tham số đã chọn
  const createPrompt = () => {
    const subjectName = subjects.find(s => s.id === subject)?.name || subject;
    const gradeName = grades.find(g => g.id === grade)?.name || `Lớp ${grade}`;
    const contentTypeName = contentType === 'lesson' ? 'bài học' : 'bài kiểm tra';
    const difficultyName = 
      difficulty === 'basic' ? 'cơ bản' : 
      difficulty === 'intermediate' ? 'trung bình' : 'nâng cao';
    
    return `Tạo ${contentTypeName} về chủ đề "${topic}" cho môn ${subjectName} ${gradeName} với độ khó ${difficultyName} theo chương trình giáo dục Việt Nam.`;
  };

  // Mô phỏng nội dung được sinh ra
  const generateMockContent = () => {
    const subjectName = subjects.find(s => s.id === subject)?.name || subject;
    const gradeName = grades.find(g => g.id === grade)?.name || `Lớp ${grade}`;
    
    if (contentType === 'lesson') {
      return `# Bài học: ${topic || 'Chủ đề mới'} - ${subjectName} ${gradeName}

## Mục tiêu bài học
- Hiểu được các khái niệm cơ bản về ${topic || 'chủ đề này'}
- Áp dụng được kiến thức vào bài tập thực hành
- Phát triển kỹ năng tư duy logic và giải quyết vấn đề

## Nội dung bài học

### 1. Giới thiệu
${topic || 'Chủ đề này'} là một phần quan trọng trong chương trình ${subjectName} ${gradeName}. Việc hiểu rõ các khái niệm cơ bản sẽ giúp học sinh xây dựng nền tảng vững chắc cho các kiến thức nâng cao hơn.

### 2. Khái niệm cơ bản
- Định nghĩa và ý nghĩa
- Các thuật ngữ quan trọng
- Ví dụ minh họa

### 3. Phương pháp giải quyết
- Các bước thực hiện
- Công thức áp dụng
- Kỹ thuật ghi nhớ

### 4. Ví dụ minh họa
Ví dụ 1: [Mô tả ví dụ cụ thể]
Ví dụ 2: [Mô tả ví dụ cụ thể]

### 5. Bài tập thực hành
1. [Bài tập 1]
2. [Bài tập 2]
3. [Bài tập 3]

## Tổng kết
Trong bài học này, chúng ta đã tìm hiểu về ${topic || 'chủ đề quan trọng'}. Hãy tiếp tục luyện tập để củng cố kiến thức và kỹ năng.`;
    } else {
      return `# Bài kiểm tra: ${topic || 'Chủ đề mới'} - ${subjectName} ${gradeName}

## Thông tin bài kiểm tra
- Thời gian: 30 phút
- Số câu hỏi: 10
- Độ khó: ${difficulty === 'basic' ? 'Cơ bản' : difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}

## Câu hỏi

### Câu 1: [Câu hỏi về khái niệm cơ bản]
A. Đáp án 1
B. Đáp án 2
C. Đáp án 3
D. Đáp án 4

### Câu 2: [Câu hỏi về ứng dụng]
A. Đáp án 1
B. Đáp án 2
C. Đáp án 3
D. Đáp án 4

### Câu 3: [Câu hỏi về phân tích]
A. Đáp án 1
B. Đáp án 2
C. Đáp án 3
D. Đáp án 4

### Câu 4: [Câu hỏi về tổng hợp]
A. Đáp án 1
B. Đáp án 2
C. Đáp án 3
D. Đáp án 4

### Câu 5: [Câu hỏi về đánh giá]
A. Đáp án 1
B. Đáp án 2
C. Đáp án 3
D. Đáp án 4

### Câu 6-10: [Các câu hỏi tiếp theo]
...

## Đáp án
1. C
2. A
3. D
4. B
5. A
6-10. [Đáp án cho các câu hỏi tiếp theo]`;
    }
  };

  // Xử lý lưu nội dung
  const handleSaveContent = () => {
    // Trong triển khai thực tế, đây sẽ là một API call để lưu nội dung vào cơ sở dữ liệu
    alert('Đã lưu nội dung thành công!');
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Tích hợp AI - Sinh nội dung học tập</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel điều khiển */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Cấu hình</h2>
              
              {/* Chọn nhà cung cấp AI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhà cung cấp AI
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="provider"
                      value="openai"
                      checked={selectedProvider === 'openai'}
                      onChange={() => setSelectedProvider('openai')}
                    />
                    <span className="ml-2">OpenAI</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="provider"
                      value="googleai"
                      checked={selectedProvider === 'googleai'}
                      onChange={() => setSelectedProvider('googleai')}
                    />
                    <span className="ml-2">Google AI</span>
                  </label>
                </div>
              </div>
              
              {/* Chọn model */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedProvider === 'openai'
                    ? openAIModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))
                    : googleAIModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                </select>
              </div>
              
              {/* Chọn loại nội dung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại nội dung
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="contentType"
                      value="lesson"
                      checked={contentType === 'lesson'}
                      onChange={() => setContentType('lesson')}
                    />
                    <span className="ml-2">Bài học</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="contentType"
                      value="quiz"
                      checked={contentType === 'quiz'}
                      onChange={() => setContentType('quiz')}
                    />
                    <span className="ml-2">Bài kiểm tra</span>
                  </label>
                </div>
              </div>
              
              {/* Chọn môn học */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Môn học
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Chọn lớp */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Nhập chủ đề */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ đề
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Nhập chủ đề cụ thể"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Chọn độ khó */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Độ khó
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'basic' | 'intermediate' | 'advanced')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Cơ bản</option>
                  <option value="intermediate">Trung bình</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
              
              {/* Nút sinh nội dung */}
              <div>
                <button
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Đang sinh nội dung...' : 'Sinh nội dung'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Khu vực hiển thị nội dung */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Nội dung được sinh</h2>
                
                {generatedContent && (
                  <button
                    onClick={handleSaveContent}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Lưu nội dung
                  </button>
                )}
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {isGenerating ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang sinh nội dung...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  Cấu hình các tham số và nhấn "Sinh nội dung" để tạo nội dung học tập
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
