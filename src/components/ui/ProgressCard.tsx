// src/components/ui/ProgressCard.tsx
// Component hiển thị thẻ tiến trình học tập

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  className?: string;
}

export default function ProgressCard({ 
  title, 
  value, 
  total, 
  icon = '📊', 
  color = 'blue',
  className = '' 
}: ProgressCardProps) {
  // Tính phần trăm hoàn thành
  const percentage = Math.round((value / total) * 100) || 0;
  
  // Xác định màu sắc
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          progress: 'bg-blue-600',
          icon: 'bg-blue-100 text-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          progress: 'bg-green-600',
          icon: 'bg-green-100 text-green-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          progress: 'bg-purple-600',
          icon: 'bg-purple-100 text-purple-600'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          progress: 'bg-orange-600',
          icon: 'bg-orange-100 text-orange-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          progress: 'bg-red-600',
          icon: 'bg-red-100 text-red-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          progress: 'bg-blue-600',
          icon: 'bg-blue-100 text-blue-600'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`${colors.bg} ${className} rounded-lg p-5 shadow-sm`}>
      <div className="flex items-center mb-3">
        <div className={`${colors.icon} w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className={`${colors.text} font-medium`}>{value} / {total}</span>
        <span className={`${colors.text} font-medium`}>{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${colors.progress} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
