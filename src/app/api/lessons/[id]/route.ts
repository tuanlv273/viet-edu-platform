// src/app/api/lessons/[id]/route.ts
// API route để lấy chi tiết bài học

import { NextRequest, NextResponse } from 'next/server';
import { getLessonDetails } from '@/lib/content/contentManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng
    await requireAuth();
    
    const lessonId = Number(params.id);
    
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'ID bài học không hợp lệ' },
        { status: 400 }
      );
    }
    
    const lessonDetails = await getLessonDetails(lessonId);
    
    return NextResponse.json({
      success: true,
      lesson: lessonDetails
    });
  } catch (error) {
    console.error('Error fetching lesson details:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message === 'Lesson not found') {
      return NextResponse.json(
        { error: 'Không tìm thấy bài học' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy chi tiết bài học' },
      { status: 500 }
    );
  }
}
