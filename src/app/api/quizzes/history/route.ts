// src/app/api/quizzes/history/route.ts
// API route để lấy lịch sử làm bài kiểm tra của người dùng

import { NextRequest, NextResponse } from 'next/server';
import { getUserQuizHistory } from '@/lib/quiz/quizManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Lấy lịch sử làm bài kiểm tra
    const history = await getUserQuizHistory(user.id);
    
    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy lịch sử làm bài kiểm tra' },
      { status: 500 }
    );
  }
}
