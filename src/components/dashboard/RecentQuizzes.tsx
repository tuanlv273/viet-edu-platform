// src/components/dashboard/RecentQuizzes.tsx
// Component hiển thị các bài kiểm tra gần đây cho dashboard

import { Quiz } from '@/lib/db/schema';
import QuizCard from '../ui/QuizCard';

interface RecentQuizzesProps {
  quizzes: (Quiz & { 
    result?: {
      score: number;
      passed: boolean;
      completed_at: string;
    } 
  })[];
  className?: string;
}

export default function RecentQuizzes({ quizzes, className = '' }: RecentQuizzesProps) {
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className={`${className} bg-white rounded-lg shadow-sm p-6`}>
        <h2 className="text-xl font-bold mb-4">Bài kiểm tra gần đây</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Chưa có bài kiểm tra nào</p>
          <p className="text-sm">Hãy bắt đầu làm bài kiểm tra để theo dõi tiến trình</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-sm p-6`}>
      <h2 className="text-xl font-bold mb-4">Bài kiểm tra gần đây</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard 
            key={quiz.id} 
            quiz={quiz} 
            result={quiz.result}
          />
        ))}
      </div>
    </div>
  );
}
