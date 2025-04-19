'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/lib/auth/AuthContext';
import Layout from '@/components/layout/Layout';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  // Danh sách lớp học
  const grades = [
    { id: 1, name: 'Lớp 1' },
    { id: 2, name: 'Lớp 2' },
    { id: 3, name: 'Lớp 3' },
    { id: 4, name: 'Lớp 4' },
    { id: 5, name: 'Lớp 5' },
    { id: 6, name: 'Lớp 6' },
    { id: 7, name: 'Lớp 7' },
    { id: 8, name: 'Lớp 8' },
    { id: 9, name: 'Lớp 9' },
  ];

  const handleRegister = async (username: string, email: string, password: string, fullName: string, gradeId: number) => {
    try {
      await register(username, email, password, fullName, gradeId);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <RegisterForm onSubmit={handleRegister} grades={grades} />
        {error && (
          <div className="mt-4 text-center text-red-600">
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
}
