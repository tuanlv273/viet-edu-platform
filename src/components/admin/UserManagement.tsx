// src/components/admin/UserManagement.tsx
// Component quản lý người dùng cho admin

import { useState } from 'react';
import { User } from '@/lib/db/schema';

interface UserManagementProps {
  users: User[];
  roles: { id: number; name: string }[];
  onUpdateUser: (userId: number, userData: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
  onAssignRole: (userId: number, roleId: number) => Promise<void>;
  onRemoveRole: (userId: number, roleId: number) => Promise<void>;
  className?: string;
}

export default function UserManagement({ 
  users, 
  roles,
  onUpdateUser,
  onDeleteUser,
  onAssignRole,
  onRemoveRole,
  className = '' 
}: UserManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleUpdateStatus = async (userId: number, isActive: boolean) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await onUpdateUser(userId, { is_active: isActive });
      
      setSuccess(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản người dùng`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await onDeleteUser(selectedUser.id);
      
      setSuccess('Đã xóa tài khoản người dùng');
      setShowConfirmDelete(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-6`}>
      <h2 className="text-2xl font-bold mb-6">Quản lý người dùng</h2>
      
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên đăng nhập
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Họ và tên
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.full_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Hiển thị vai trò của người dùng */}
                  <div className="flex flex-wrap gap-1">
                    {/* Giả sử user có thuộc tính userRoles */}
                    {(user as any).userRoles?.map((userRole: any) => (
                      <span key={userRole.role_id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {roles.find(r => r.id === userRole.role_id)?.name || 'Unknown'}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(user.id, !user.is_active)}
                      disabled={isLoading}
                      className={`px-2 py-1 rounded text-xs ${
                        user.is_active 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowConfirmDelete(true);
                      }}
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
      
      {/* Modal xác nhận xóa */}
      {showConfirmDelete && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa tài khoản của người dùng <span className="font-semibold">{selectedUser.username}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {isLoading ? 'Đang xử lý...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
