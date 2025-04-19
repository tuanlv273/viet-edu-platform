// src/app/api/progress/subject/route.ts
// API route để lấy tiến trình học tập chi tiết của một môn học

import { NextRequest, NextResponse } from 'next/server';
import { getSubjectProgressDetail } from '@/lib/progress/progressManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const gradeId = searchParams.get('gradeId');
    
    if (!subjectId || !gradeId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin môn học hoặc lớp' },
        { status: 400 }
      );
    }
    
    // Lấy tiến trình học tập chi tiết của môn học
    const progress = await getSubjectProgressDetail(
      user.id,
      Number(subjectId),
      Number(gradeId)
    );
    
    return NextResponse.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching subject progress:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy tiến trình học tập của môn học' },
      { status: 500 }
    );
  }
}
