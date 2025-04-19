// src/app/api/progress/user/route.ts
// API route để lấy tiến trình học tập tổng quan của người dùng

import { NextRequest, NextResponse } from 'next/server';
import { getUserOverallProgress } from '@/lib/progress/progressManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Lấy tiến trình học tập tổng quan
    const progress = await getUserOverallProgress(user.id);
    
    return NextResponse.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy tiến trình học tập' },
      { status: 500 }
    );
  }
}
