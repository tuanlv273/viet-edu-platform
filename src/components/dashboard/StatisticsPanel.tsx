// src/components/dashboard/StatisticsPanel.tsx
// Component hiển thị thống kê tổng quan cho dashboard

import ProgressCard from '../ui/ProgressCard';

interface StatisticsPanelProps {
  statistics: {
    completedLessons: number;
    totalLessons: number;
    passedQuizzes: number;
    totalQuizzes: number;
    averageScore: number;
    learningStreak: number;
  };
  className?: string;
}

export default function StatisticsPanel({ statistics, className = '' }: StatisticsPanelProps) {
  return (
    <div className={`${className}`}>
      <h2 className="text-2xl font-bold mb-4">Thống kê học tập</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProgressCard
          title="Bài học đã hoàn thành"
          value={statistics.completedLessons}
          total={statistics.totalLessons}
          icon="📚"
          color="blue"
        />
        
        <ProgressCard
          title="Bài kiểm tra đã đạt"
          value={statistics.passedQuizzes}
          total={statistics.totalQuizzes}
          icon="✅"
          color="green"
        />
        
        <div className="bg-purple-50 rounded-lg p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
              📊
            </div>
            <h3 className="text-lg font-semibold">Điểm trung bình</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-purple-700">
              {statistics.averageScore.toFixed(1)}
            </span>
            <span className="text-lg text-purple-600 ml-1">/10</span>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
              🔥
            </div>
            <h3 className="text-lg font-semibold">Chuỗi ngày học</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-orange-700">
              {statistics.learningStreak}
            </span>
            <span className="text-lg text-orange-600 ml-1">ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
}
