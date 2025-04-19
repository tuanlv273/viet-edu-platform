// src/app/api/recommendations/lessons/route.ts
// API route để lấy đề xuất bài học

import { NextRequest, NextResponse } from 'next/server';
import { generateLessonRecommendations } from '@/lib/recommendation/recommendationEngine';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    
    // Lấy đề xuất bài học
    const recommendations = await generateLessonRecommendations(
      user.id,
      user.gradeId,
      limit
    );
    
    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching lesson recommendations:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy đề xuất bài học' },
      { status: 500 }
    );
  }
}
