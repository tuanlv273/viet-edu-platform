// src/components/profile/UserProfile.tsx
// Component hiển thị thông tin cá nhân của người dùng

import { useState } from 'react';
import { User } from '@/lib/db/schema';

interface UserProfileProps {
  user: User;
  grades: { id: number; name: string }[];
  onUpdate: (userData: Partial<User>) => Promise<void>;
  className?: string;
}

export default function UserProfile({ user, grades, onUpdate, className = '' }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [gradeId, setGradeId] = useState<number | undefined>(user.grade_id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await onUpdate({
        full_name: fullName,
        email,
        grade_id: gradeId
      });
      
      setSuccess('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Chỉnh sửa
          </button>
        )}
      </div>
      
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
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="grade" className="block text-gray-700 font-medium mb-2">
              Lớp
            </label>
            <select
              id="grade"
              value={gradeId}
              onChange={(e) => setGradeId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn lớp</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md font-medium transition-colors ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFullName(user.full_name);
                setEmail(user.email);
                setGradeId(user.grade_id);
                setError('');
                setSuccess('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-32 text-gray-600">Tên đăng nhập:</div>
            <div className="font-medium">{user.username}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 text-gray-600">Họ và tên:</div>
            <div className="font-medium">{user.full_name}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 text-gray-600">Email:</div>
            <div className="font-medium">{user.email}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 text-gray-600">Lớp:</div>
            <div className="font-medium">
              {user.grade_id ? grades.find(g => g.id === user.grade_id)?.name || 'Không xác định' : 'Chưa chọn lớp'}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 text-gray-600">Ngày tham gia:</div>
            <div className="font-medium">{new Date(user.created_at).toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
