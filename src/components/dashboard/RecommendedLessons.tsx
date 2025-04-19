// src/components/dashboard/RecommendedLessons.tsx
// Component hiển thị các bài học được đề xuất cho dashboard

import { Lesson } from '@/lib/db/schema';
import LessonCard from '../ui/LessonCard';

interface RecommendedLessonsProps {
  lessons: (Lesson & { progress?: number })[];
  className?: string;
}

export default function RecommendedLessons({ lessons, className = '' }: RecommendedLessonsProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className={`${className} bg-white rounded-lg shadow-sm p-6`}>
        <h2 className="text-xl font-bold mb-4">Bài học đề xuất</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Chưa có bài học đề xuất</p>
          <p className="text-sm">Hãy bắt đầu học các bài học để nhận đề xuất phù hợp</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-sm p-6`}>
      <h2 className="text-xl font-bold mb-4">Bài học đề xuất</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <LessonCard 
            key={lesson.id} 
            lesson={lesson} 
            progress={lesson.progress || 0}
          />
        ))}
      </div>
    </div>
  );
}
