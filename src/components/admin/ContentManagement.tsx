// src/components/admin/ContentManagement.tsx
// Component quản lý nội dung học tập cho admin

import { useState } from 'react';
import { Subject, Lesson, Quiz } from '@/lib/db/schema';

interface ContentManagementProps {
  subjects: Subject[];
  lessons: Lesson[];
  quizzes: Quiz[];
  grades: { id: number; name: string }[];
  onCreateSubject: (subject: Omit<Subject, 'id' | 'created_at'>) => Promise<void>;
  onUpdateSubject: (id: number, subject: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (id: number) => Promise<void>;
  onCreateLesson: (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateLesson: (id: number, lesson: Partial<Lesson>) => Promise<void>;
  onDeleteLesson: (id: number) => Promise<void>;
  className?: string;
}

export default function ContentManagement({
  subjects,
  lessons,
  quizzes,
  grades,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  className = ''
}: ContentManagementProps) {
  const [activeTab, setActiveTab] = useState<'subjects' | 'lessons' | 'quizzes'>('subjects');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State cho form tạo/chỉnh sửa môn học
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectIconUrl, setSubjectIconUrl] = useState('');
  
  // State cho form tạo/chỉnh sửa bài học
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonSubjectId, setLessonSubjectId] = useState<number>(0);
  const [lessonGradeId, setLessonGradeId] = useState<number>(0);
  const [lessonDifficulty, setLessonDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [lessonOrder, setLessonOrder] = useState(0);

  // Xử lý form môn học
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectName) {
      setError('Vui lòng nhập tên môn học');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      if (editingSubject) {
        // Cập nhật môn học
        await onUpdateSubject(editingSubject.id, {
          name: subjectName,
          description: subjectDescription || undefined,
          icon_url: subjectIconUrl || undefined
        });
        setSuccess('Đã cập nhật môn học thành công');
      } else {
        // Tạo môn học mới
        await onCreateSubject({
          name: subjectName,
          description: subjectDescription || undefined,
          icon_url: subjectIconUrl || undefined
        });
        setSuccess('Đã tạo môn học mới thành công');
      }
      
      resetSubjectForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xử lý form bài học
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonTitle || !lessonSubjectId || !lessonGradeId) {
      setError('Vui lòng nhập đầy đủ thông tin bài học');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      if (editingLesson) {
        // Cập nhật bài học
        await onUpdateLesson(editingLesson.id, {
          title: lessonTitle,
          description: lessonDescription || undefined,
          subject_id: lessonSubjectId,
          grade_id: lessonGradeId,
          difficulty_level: lessonDifficulty,
          order_index: lessonOrder
        });
        setSuccess('Đã cập nhật bài học thành công');
      } else {
        // Tạo bài học mới
        await onCreateLesson({
          title: lessonTitle,
          description: lessonDescription || undefined,
          subject_id: lessonSubjectId,
          grade_id: lessonGradeId,
          difficulty_level: lessonDifficulty,
          order_index: lessonOrder
        });
        setSuccess('Đã tạo bài học mới thành công');
      }
      
      resetLessonForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form môn học
  const resetSubjectForm = () => {
    setSubjectName('');
    setSubjectDescription('');
    setSubjectIconUrl('');
    setEditingSubject(null);
    setShowSubjectForm(false);
  };
  
  // Reset form bài học
  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setLessonSubjectId(0);
    setLessonGradeId(0);
    setLessonDifficulty('basic');
    setLessonOrder(0);
    setEditingLesson(null);
    setShowLessonForm(false);
  };
  
  // Xử lý chỉnh sửa môn học
  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSubjectDescription(subject.description || '');
    setSubjectIconUrl(subject.icon_url || '');
    setShowSubjectForm(true);
  };
  
  // Xử lý chỉnh sửa bài học
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || '');
    setLessonSubjectId(lesson.subject_id);
    setLessonGradeId(lesson.grade_id);
    setLessonDifficulty(lesson.difficulty_level);
    setLessonOrder(lesson.order_index);
    setShowLessonForm(true);
  };

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-6`}>
      <h2 className="text-2xl font-bold mb-6">Quản lý nội dung học tập</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subjects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Môn học
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lessons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bài học
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bài kiểm tra
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div>
        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Danh sách môn học</h3>
              <button
                onClick={() => {
                  resetSubjectForm();
                  setShowSubjectForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm môn học
              </button>
            </div>
            
            {/* Subject Form */}
            {showSubjectForm && (
              <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                <h4 className="text-lg font-medium mb-4">
                  {editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
                </h4>
                <form onSubmit={handleSubjectSubmit}>
                  <div className="mb-4">
                    <label htmlFor="subjectName" className="block text-gray-700 font-medium mb-2">
                      Tên môn học
                    </label>
                    <input
                      type="text"
                      id="subjectName"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subjectDescription" className="block text-gray-700 font-medium mb-2">
                      Mô tả
                    </label>
                    <textarea
                      id="subjectDescription"
                      value={subjectDescription}
                      onChange={(e) => setSubjectDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subjectIconUrl" className="block text-gray-700 font-medium mb-2">
                      URL biểu tượng
                    </label>
                    <input
                      type="text"
                      id="subjectIconUrl"
                      value={subjectIconUrl}
                      onChange={(e) => setSubjectIconUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md font-medium transition-colors ${
                        isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Đang xử lý...' : editingSubject ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={resetSubjectForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Subjects List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên môn học
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {subject.icon_url ? (
                            <img src={subject.icon_url} alt={subject.name} className="w-8 h-8 mr-3" />
                          ) : (
                            <div className="w-8 h-8 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                              {subject.name.charAt(0)}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2">{subject.description || 'Không có mô tả'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => onDeleteSubject(subject.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Danh sách bài học</h3>
              <button
                onClick={() => {
                  resetLessonForm();
                  setShowLessonForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm bài học
              </button>
            </div>
            
            {/* Lesson Form */}
            {showLessonForm && (
              <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                <h4 className="text-lg font-medium mb-4">
                  {editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                </h4>
                <form onSubmit={handleLessonSubmit}>
                  <div className="mb-4">
                    <label htmlFor="lessonTitle" className="block text-gray-700 font-medium mb-2">
                      Tiêu đề bài học
                    </label>
                    <input
                      type="text"
                      id="lessonTitle"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="lessonDescription" className="block text-gray-700 font-medium mb-2">
                      Mô tả
                    </label>
                    <textarea
                      id="lessonDescription"
                      value={lessonDescription}
                      onChange={(e) => setLessonDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="lessonSubject" className="block text-gray-700 font-medium mb-2">
                        Môn học
                      </label>
                      <select
                        id="lessonSubject"
                        value={lessonSubjectId}
                        onChange={(e) => setLessonSubjectId(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn môn học</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="lessonGrade" className="block text-gray-700 font-medium mb-2">
                        Lớp
                      </label>
                      <select
                        id="lessonGrade"
                        value={lessonGradeId}
                        onChange={(e) => setLessonGradeId(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn lớp</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="lessonDifficulty" className="block text-gray-700 font-medium mb-2">
                        Độ khó
                      </label>
                      <select
                        id="lessonDifficulty"
                        value={lessonDifficulty}
                        onChange={(e) => setLessonDifficulty(e.target.value as 'basic' | 'intermediate' | 'advanced')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="basic">Cơ bản</option>
                        <option value="intermediate">Trung bình</option>
                        <option value="advanced">Nâng cao</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="lessonOrder" className="block text-gray-700 font-medium mb-2">
                        Thứ tự
                      </label>
                      <input
                        type="number"
                        id="lessonOrder"
                        value={lessonOrder}
                        onChange={(e) => setLessonOrder(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md font-medium transition-colors ${
                        isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Đang xử lý...' : editingLesson ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={resetLessonForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Lessons List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Độ khó
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                        {lesson.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{lesson.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subjects.find(s => s.id === lesson.subject_id)?.name || 'Không xác định'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grades.find(g => g.id === lesson.grade_id)?.name || 'Không xác định'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lesson.difficulty_level === 'basic' ? 'bg-green-100 text-green-800' :
                          lesson.difficulty_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {lesson.difficulty_level === 'basic' ? 'Cơ bản' :
                           lesson.difficulty_level === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => onDeleteLesson(lesson.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Danh sách bài kiểm tra</h3>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm bài kiểm tra
              </button>
            </div>
            
            {/* Quizzes List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Độ khó
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{quiz.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subjects.find(s => s.id === quiz.subject_id)?.name || 'Không xác định'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grades.find(g => g.id === quiz.grade_id)?.name || 'Không xác định'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          quiz.quiz_type === 'practice' ? 'bg-blue-100 text-blue-800' :
                          quiz.quiz_type === 'midterm' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quiz.quiz_type === 'practice' ? 'Luyện tập' :
                           quiz.quiz_type === 'midterm' ? 'Giữa kỳ' : 'Cuối kỳ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          quiz.difficulty_level === 'basic' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {quiz.difficulty_level === 'basic' ? 'Cơ bản' :
                           quiz.difficulty_level === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
