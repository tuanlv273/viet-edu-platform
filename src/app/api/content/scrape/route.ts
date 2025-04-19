// src/app/api/content/scrape/route.ts
// API route để thu thập nội dung học tập từ internet

import { NextRequest, NextResponse } from 'next/server';
import { searchAndScrapeEducationalContent } from '@/lib/content/contentScraper';
import { requireAdmin } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Xác thực quyền admin
    await requireAdmin();
    
    // Lấy dữ liệu từ request
    const body = await request.json();
    const { query, subject, grade } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Thiếu từ khóa tìm kiếm' },
        { status: 400 }
      );
    }
    
    // Tìm kiếm và thu thập nội dung
    const scrapedContents = await searchAndScrapeEducationalContent(
      query,
      subject,
      grade
    );
    
    return NextResponse.json({
      success: true,
      contents: scrapedContents
    });
  } catch (error) {
    console.error('Error scraping content:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Không có quyền admin' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Lỗi khi thu thập nội dung' },
      { status: 500 }
    );
  }
}
