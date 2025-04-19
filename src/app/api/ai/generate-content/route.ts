// src/app/api/ai/generate-content/route.ts
// API route để sinh nội dung học tập bằng AI

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai/aiService';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Kiểm tra quyền admin
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }
    
    // Lấy tham số từ request body
    const body = await request.json();
    const { provider, model, contentType, subject, grade, topic, difficulty } = body;
    
    // Kiểm tra tham số
    if (!provider || !model || !contentType || !subject || !grade || !difficulty) {
      return NextResponse.json(
        { error: 'Thiếu tham số bắt buộc' },
        { status: 400 }
      );
    }
    
    // Sinh nội dung
    const content = await generateContent({
      provider: {
        name: provider,
        model
      },
      contentType,
      subject,
      grade,
      topic: topic || '',
      difficulty
    });
    
    return NextResponse.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error generating content:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi sinh nội dung học tập' },
      { status: 500 }
    );
  }
}
