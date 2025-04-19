// src/app/api/quizzes/[id]/route.ts
// API route để lấy chi tiết bài kiểm tra

import { NextRequest, NextResponse } from 'next/server';
import { getFullQuiz } from '@/lib/quiz/quizManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng
    await requireAuth();
    
    const quizId = Number(params.id);
    
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID bài kiểm tra không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Lấy thông tin đầy đủ của bài kiểm tra
    const quiz = await getFullQuiz(quizId);
    
    // Loại bỏ thông tin về đáp án đúng trước khi gửi về client
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          id: option.id,
          question_id: option.question_id,
          option_text: option.option_text,
          order_index: option.order_index
          // Loại bỏ trường is_correct
        }))
      }))
    };
    
    return NextResponse.json({
      success: true,
      quiz: sanitizedQuiz
    });
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message === 'Quiz not found') {
      return NextResponse.json(
        { error: 'Không tìm thấy bài kiểm tra' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy chi tiết bài kiểm tra' },
      { status: 500 }
    );
  }
}
