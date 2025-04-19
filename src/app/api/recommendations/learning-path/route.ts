// src/app/api/recommendations/learning-path/route.ts
// API route để lấy lộ trình học tập cá nhân hóa

import { NextRequest, NextResponse } from 'next/server';
import { generateLearningPath } from '@/lib/recommendation/recommendationEngine';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Tạo lộ trình học tập cá nhân hóa
    const learningPath = await generateLearningPath(
      user.id,
      user.gradeId
    );
    
    return NextResponse.json({
      success: true,
      learningPath
    });
  } catch (error) {
    console.error('Error generating learning path:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi tạo lộ trình học tập' },
      { status: 500 }
    );
  }
}
