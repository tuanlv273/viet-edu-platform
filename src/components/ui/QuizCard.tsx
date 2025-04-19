// src/components/ui/QuizCard.tsx
// Component hiển thị thẻ bài kiểm tra

import Link from 'next/link';
import { Quiz } from '@/lib/db/schema';

interface QuizCardProps {
  quiz: Quiz;
  result?: {
    score: number;
    passed: boolean;
    completed_at: string;
  };
  className?: string;
}

export default function QuizCard({ quiz, result, className = '' }: QuizCardProps) {
  // Xác định màu dựa trên loại bài kiểm tra
  const getQuizTypeColor = (type: string) => {
    switch (type) {
      case 'practice':
        return 'bg-blue-50 border-blue-200';
      case 'midterm':
        return 'bg-orange-50 border-orange-200';
      case 'final':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Xác định nhãn loại bài kiểm tra
  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case 'practice':
        return 'Luyện tập';
      case 'midterm':
        return 'Giữa kỳ';
      case 'final':
        return 'Cuối kỳ';
      default:
        return 'Không xác định';
    }
  };

  // Xác định nhãn độ khó
  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'basic':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return 'Không xác định';
    }
  };

  const colorClass = getQuizTypeColor(quiz.quiz_type);
  const quizTypeLabel = getQuizTypeLabel(quiz.quiz_type);
  const difficultyLabel = getDifficultyLabel(quiz.difficulty_level);

  return (
    <Link 
      href={`/quizzes/${quiz.id}`}
      className={`${colorClass} ${className} block rounded-lg border p-5 transition-all hover:shadow-md`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          quiz.quiz_type === 'practice' ? 'bg-blue-100 text-blue-700' :
          quiz.quiz_type === 'midterm' ? 'bg-orange-100 text-orange-700' :
          'bg-red-100 text-red-700'
        }`}>
          {quizTypeLabel}
        </span>
      </div>
      
      {quiz.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-3 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          quiz.difficulty_level === 'basic' ? 'bg-green-100 text-green-700' :
          quiz.difficulty_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {difficultyLabel}
        </span>
        
        {quiz.time_limit && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {quiz.time_limit} phút
          </span>
        )}
        
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          Điểm đạt: {quiz.passing_score}
        </span>
      </div>
      
      {/* Kết quả bài kiểm tra nếu có */}
      {result && (
        <div className={`mt-3 p-3 rounded-md ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {result.passed ? 'Đã hoàn thành' : 'Chưa đạt'}
            </span>
            <span className="text-sm font-bold">
              {result.score} điểm
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Hoàn thành: {new Date(result.completed_at).toLocaleDateString('vi-VN')}
          </div>
        </div>
      )}
      
      {!result && (
        <div className="mt-3">
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors">
            Bắt đầu làm bài
          </button>
        </div>
      )}
    </Link>
  );
}
