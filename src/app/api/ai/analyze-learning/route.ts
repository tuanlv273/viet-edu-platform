// src/app/api/ai/analyze-learning/route.ts
// API route để phân tích dữ liệu học tập bằng AI

import { NextRequest, NextResponse } from 'next/server';
import { analyzeLearningData } from '@/lib/ai/aiService';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    // Kiểm tra quyền admin hoặc giáo viên
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }
    
    // Lấy tham số từ request body
    const body = await request.json();
    const { provider, model, studentId, subject, timeRange } = body;
    
    // Kiểm tra tham số
    if (!provider || !model || !studentId || !subject || !timeRange) {
      return NextResponse.json(
        { error: 'Thiếu tham số bắt buộc' },
        { status: 400 }
      );
    }
    
    // Phân tích dữ liệu học tập
    const analysis = await analyzeLearningData({
      provider: {
        name: provider,
        model
      },
      studentId,
      subject,
      timeRange
    });
    
    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing learning data:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi phân tích dữ liệu học tập' },
      { status: 500 }
    );
  }
}
