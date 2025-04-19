// src/app/api/progress/update/route.ts
// API route để cập nhật tiến trình học tập của bài học

import { NextRequest, NextResponse } from 'next/server';
import { updateLessonProgress } from '@/lib/progress/progressManager';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Lấy dữ liệu từ request
    const body = await request.json();
    const { lessonId, status, completionPercentage } = body;
    
    if (!lessonId || !status || completionPercentage === undefined) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cần thiết' },
        { status: 400 }
      );
    }
    
    // Kiểm tra status hợp lệ
    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Cập nhật tiến trình học tập
    await updateLessonProgress(
      user.id,
      Number(lessonId),
      status,
      Number(completionPercentage)
    );
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật tiến trình thành công'
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật tiến trình học tập' },
      { status: 500 }
    );
  }
}
