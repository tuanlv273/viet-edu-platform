// src/middleware.ts
// Middleware để bảo vệ các route cần xác thực

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthToken } from './lib/auth/session';

// Các route cần xác thực
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/subjects',
  '/lessons',
  '/quizzes',
];

// Các route dành cho admin
const adminRoutes = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const token = getAuthToken();
  const { pathname } = request.nextUrl;
  
  // Kiểm tra xem route hiện tại có cần xác thực không
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Kiểm tra xem route hiện tại có dành cho admin không
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Nếu không có token và đang truy cập route cần xác thực
  if (!token && isProtectedRoute) {
    // Chuyển hướng đến trang đăng nhập
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Nếu đang truy cập route dành cho admin, cần kiểm tra quyền admin
  if (isAdminRoute) {
    // Kiểm tra quyền admin sẽ được thực hiện trong API route
    // Ở đây chỉ kiểm tra xem có token không
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Nếu đã đăng nhập và đang truy cập trang đăng nhập hoặc đăng ký
  if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    // Chuyển hướng đến trang dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Cấu hình các route sẽ áp dụng middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
