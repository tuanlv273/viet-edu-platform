// src/components/dashboard/LearningPathPanel.tsx
// Component hiển thị lộ trình học tập cho dashboard

import Link from 'next/link';

interface LearningPathItem {
  id: number;
  type: 'lesson' | 'quiz';
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface LearningPathPanelProps {
  path: {
    id: number;
    title: string;
    description?: string;
    items: LearningPathItem[];
  };
  className?: string;
}

export default function LearningPathPanel({ path, className = '' }: LearningPathPanelProps) {
  if (!path || !path.items || path.items.length === 0) {
    return (
      <div className={`${className} bg-white rounded-lg shadow-sm p-6`}>
        <h2 className="text-xl font-bold mb-4">Lộ trình học tập</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Chưa có lộ trình học tập</p>
          <p className="text-sm">Hãy khám phá các môn học để tạo lộ trình học tập</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-sm p-6`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lộ trình học tập</h2>
        <Link 
          href={`/learning-paths/${path.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Xem chi tiết
        </Link>
      </div>
      
      {path.description && (
        <p className="text-gray-600 mb-4">{path.description}</p>
      )}
      
      <div className="relative">
        {/* Đường kẻ dọc kết nối các mục */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <ul className="space-y-4">
          {path.items.map((item, index) => (
            <li key={item.id} className="relative pl-9">
              {/* Điểm tròn trạng thái */}
              <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                item.status === 'completed' ? 'bg-green-100 text-green-600' :
                item.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {item.status === 'completed' ? '✓' : index + 1}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {item.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.type === 'lesson' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {item.type === 'lesson' ? 'Bài học' : 'Kiểm tra'}
                  </span>
                </div>
                
                <div className="mt-2">
                  <Link 
                    href={`/${item.type === 'lesson' ? 'lessons' : 'quizzes'}/${item.id}`}
                    className={`inline-block px-3 py-1 text-sm rounded ${
                      item.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                      'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {item.status === 'completed' ? 'Đã hoàn thành' : 
                     item.status === 'in_progress' ? 'Tiếp tục' : 'Bắt đầu'}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
