// src/components/ui/LessonCard.tsx
// Component hiển thị thẻ bài học

import Link from 'next/link';
import { Lesson } from '@/lib/db/schema';

interface LessonCardProps {
  lesson: Lesson;
  progress?: number; // Tiến trình hoàn thành (0-100)
  className?: string;
}

export default function LessonCard({ lesson, progress = 0, className = '' }: LessonCardProps) {
  // Xác định màu dựa trên độ khó
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-50 border-green-200';
      case 'intermediate':
        return 'bg-blue-50 border-blue-200';
      case 'advanced':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  const colorClass = getDifficultyColor(lesson.difficulty_level);
  const difficultyLabel = getDifficultyLabel(lesson.difficulty_level);

  return (
    <Link 
      href={`/lessons/${lesson.id}`}
      className={`${colorClass} ${className} block rounded-lg border p-5 transition-all hover:shadow-md`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{lesson.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          lesson.difficulty_level === 'basic' ? 'bg-green-100 text-green-700' :
          lesson.difficulty_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {difficultyLabel}
        </span>
      </div>
      
      {lesson.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
      )}
      
      {/* Thanh tiến trình */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Tiến trình</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );
}
