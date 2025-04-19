// src/app/api/content/recommend/route.ts
// API route để lấy nội dung đề xuất dựa trên tiến trình học tập

import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedContent } from '@/lib/content/contentManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');
    
    if (!gradeId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin lớp' },
        { status: 400 }
      );
    }
    
    const recommendedContent = await getRecommendedContent(
      user.id,
      Number(gradeId)
    );
    
    return NextResponse.json({
      success: true,
      ...recommendedContent
    });
  } catch (error) {
    console.error('Error getting recommended content:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy nội dung đề xuất' },
      { status: 500 }
    );
  }
}
