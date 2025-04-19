// src/components/ui/SubjectCard.tsx
// Component hiển thị thẻ môn học

import Link from 'next/link';
import { Subject } from '@/lib/db/schema';

interface SubjectCardProps {
  subject: Subject;
  className?: string;
}

export default function SubjectCard({ subject, className = '' }: SubjectCardProps) {
  // Xác định màu nền dựa trên tên môn học
  const getSubjectColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'toán':
        return 'bg-red-100 text-red-600 hover:bg-red-200';
      case 'tiếng anh':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'vật lý':
        return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
      case 'hóa học':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      case 'tin học':
        return 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  // Xác định biểu tượng dựa trên tên môn học
  const getSubjectIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'toán':
        return '📊';
      case 'tiếng anh':
        return '🔤';
      case 'vật lý':
        return '⚛️';
      case 'hóa học':
        return '🧪';
      case 'tin học':
        return '💻';
      default:
        return '📚';
    }
  };

  const colorClass = getSubjectColor(subject.name);
  const icon = subject.icon_url ? 
    <img src={subject.icon_url} alt={subject.name} className="w-12 h-12 mb-3 mx-auto" /> : 
    <div className="text-4xl mb-3">{getSubjectIcon(subject.name)}</div>;

  return (
    <Link 
      href={`/subjects/${subject.id}`}
      className={`${colorClass} ${className} rounded-xl p-6 text-center transition-all hover:shadow-md`}
    >
      {icon}
      <h3 className="text-xl font-semibold">{subject.name}</h3>
      {subject.description && (
        <p className="mt-2 text-sm opacity-80">{subject.description}</p>
      )}
    </Link>
  );
}
