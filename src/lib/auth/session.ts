// src/lib/auth/session.ts
// Quản lý phiên đăng nhập và cookie

import { cookies } from 'next/headers';
import { User } from '../db/schema';
import { verifyToken } from './auth';

// Tên cookie lưu token
const AUTH_TOKEN_COOKIE = 'viet-edu-auth-token';

// Lưu token vào cookie
export function setAuthCookie(token: string): void {
  cookies().set({
    name: AUTH_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    // Thời hạn 7 ngày
    maxAge: 60 * 60 * 24 * 7
  });
}

// Xóa cookie khi đăng xuất
export function clearAuthCookie(): void {
  cookies().delete(AUTH_TOKEN_COOKIE);
}

// Lấy token từ cookie
export function getAuthToken(): string | undefined {
  const cookie = cookies().get(AUTH_TOKEN_COOKIE);
  return cookie?.value;
}

// Lấy thông tin người dùng hiện tại từ token
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    const user = await verifyToken(token);
    return user;
  } catch (error) {
    // Nếu token không hợp lệ, xóa cookie
    clearAuthCookie();
    return null;
  }
}

// Middleware kiểm tra xác thực
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Middleware kiểm tra quyền admin
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  
  // Kiểm tra xem người dùng có quyền admin không
  // Giả sử có hàm userHasRole từ models/user
  const isAdmin = await import('../db/models/user').then(
    ({ userHasRole }) => userHasRole(user.id, 'admin')
  );
  
  if (!isAdmin) {
    throw new Error('Forbidden');
  }
  
  return user;
}
