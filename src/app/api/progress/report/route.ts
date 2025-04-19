// src/app/api/progress/report/route.ts
// API route để tạo báo cáo tiến trình học tập

import { NextRequest, NextResponse } from 'next/server';
import { generateProgressReport } from '@/lib/progress/progressManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    const user = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'week' | 'month' | 'semester' | 'year';
    
    if (!period || !['week', 'month', 'semester', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Khoảng thời gian không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Tạo báo cáo tiến trình học tập
    const report = await generateProgressReport(user.id, period);
    
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating progress report:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi tạo báo cáo tiến trình học tập' },
      { status: 500 }
    );
  }
}
