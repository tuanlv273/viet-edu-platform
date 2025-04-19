// src/app/api/auth/logout/route.ts
// API route cho đăng xuất người dùng

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Tạo response
    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
    
    // Xóa cookie xác thực
    clearAuthCookie();
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Đăng xuất thất bại' },
      { status: 500 }
    );
  }
}
