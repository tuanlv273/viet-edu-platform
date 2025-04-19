// src/app/api/auth/me/route.ts
// API route để lấy thông tin người dùng hiện tại

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Lấy thông tin người dùng hiện tại từ session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy phiên đăng nhập' },
        { status: 401 }
      );
    }
    
    // Trả về thông tin người dùng
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        gradeId: user.grade_id,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}
