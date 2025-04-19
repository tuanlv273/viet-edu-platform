// src/app/api/quizzes/route.ts
// API route để lấy danh sách bài kiểm tra

import { NextRequest, NextResponse } from 'next/server';
import { getQuizzesBySubjectAndGrade, getQuizzesByLesson } from '@/lib/db/models/quiz';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const gradeId = searchParams.get('gradeId');
    const lessonId = searchParams.get('lessonId');
    
    let quizzes;
    
    if (lessonId) {
      // Lấy bài kiểm tra theo bài học
      quizzes = await getQuizzesByLesson(Number(lessonId));
    } else if (subjectId && gradeId) {
      // Lấy bài kiểm tra theo môn học và lớp
      quizzes = await getQuizzesBySubjectAndGrade(
        Number(subjectId),
        Number(gradeId)
      );
    } else {
      return NextResponse.json(
        { error: 'Thiếu thông tin môn học, lớp hoặc bài học' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách bài kiểm tra' },
      { status: 500 }
    );
  }
}
