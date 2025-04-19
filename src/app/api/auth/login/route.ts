// src/app/api/auth/login/route.ts
// API route cho đăng nhập người dùng

import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/auth';
import { setAuthCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Lấy dữ liệu từ request
    const body = await request.json();
    const { email, password } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }
    
    // Đăng nhập người dùng
    const { user, token } = await loginUser(email, password);
    
    // Tạo response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        gradeId: user.grade_id
      }
    });
    
    // Lưu token vào cookie
    setAuthCookie(token);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Đăng nhập thất bại' },
      { status: 400 }
    );
  }
}
