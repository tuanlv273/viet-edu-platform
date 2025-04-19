// src/app/api/content/search/route.ts
// API route để tìm kiếm nội dung học tập

import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/content/contentManager';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Xác thực người dùng
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const gradeId = searchParams.get('gradeId');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Thiếu từ khóa tìm kiếm' },
        { status: 400 }
      );
    }
    
    const results = await searchContent(
      query,
      gradeId ? Number(gradeId) : undefined
    );
    
    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error searching content:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi tìm kiếm nội dung' },
      { status: 500 }
    );
  }
}
