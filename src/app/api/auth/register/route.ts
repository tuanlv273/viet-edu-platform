// src/app/api/auth/register/route.ts
// API route cho đăng ký người dùng

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/auth';
import { setAuthCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Lấy dữ liệu từ request
    const body = await request.json();
    const { username, email, password, fullName, gradeId } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }
    
    // Đăng ký người dùng
    const { user, token } = await registerUser(
      username,
      email,
      password,
      fullName,
      gradeId
    );
    
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
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Đăng ký thất bại' },
      { status: 400 }
    );
  }
}
