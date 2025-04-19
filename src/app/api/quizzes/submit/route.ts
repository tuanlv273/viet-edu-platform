// src/app/api/quizzes/submit/route.ts
// API route để nộp bài kiểm tra

import { NextRequest, NextResponse } from 'next/server';
import { submitQuiz } from '@/lib/quiz/quizManager';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Lấy dữ liệu từ request
    const body = await request.json();
    const { quizId, answers, timeSpent } = body;
    
    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Nộp bài kiểm tra và tính điểm
    const result = await submitQuiz({
      quizId: Number(quizId),
      userId: user.id,
      answers,
      timeSpent: Number(timeSpent) || 0
    });
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi nộp bài kiểm tra' },
      { status: 500 }
    );
  }
}
