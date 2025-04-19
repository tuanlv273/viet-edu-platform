// src/app/api/lessons/route.ts
// API route để lấy danh sách bài học

import { NextRequest, NextResponse } from 'next/server';
import { getLessonsBySubjectAndGrade } from '@/lib/db/models/lesson';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const gradeId = searchParams.get('gradeId');
    
    if (!subjectId || !gradeId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin môn học hoặc lớp' },
        { status: 400 }
      );
    }
    
    const lessons = await getLessonsBySubjectAndGrade(
      Number(subjectId),
      Number(gradeId)
    );
    
    return NextResponse.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách bài học' },
      { status: 500 }
    );
  }
}
