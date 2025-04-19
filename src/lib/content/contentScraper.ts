// src/lib/content/contentScraper.ts
// Thu thập nội dung học tập từ internet

import axios from 'axios';
import * as cheerio from 'cheerio';

// Interface cho kết quả tìm kiếm
export interface SearchResult {
  title: string;
  url: string;
  description: string;
  source: string;
}

// Interface cho nội dung đã thu thập
export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  source: string;
  imageUrls?: string[];
}

// Tìm kiếm nội dung học tập từ internet
export async function searchEducationalContent(
  query: string,
  subject?: string,
  grade?: number
): Promise<SearchResult[]> {
  try {
    // Xây dựng câu truy vấn tìm kiếm
    let searchQuery = query;
    if (subject) {
      searchQuery += ` ${subject}`;
    }
    if (grade) {
      searchQuery += ` lớp ${grade}`;
    }
    searchQuery += ' chương trình giáo dục Việt Nam';
    
    // Sử dụng Google Search API hoặc một API tìm kiếm khác
    // Đây là một triển khai giả định, trong thực tế cần sử dụng API thực
    
    // Giả định kết quả tìm kiếm
    const results: SearchResult[] = [
      {
        title: `Bài học về ${query} - Lớp ${grade || ''}`,
        url: `https://example.com/lessons/${query.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Nội dung bài học về ${query} dành cho học sinh lớp ${grade || ''} theo chương trình giáo dục Việt Nam.`,
        source: 'example.com'
      },
      {
        title: `${subject || ''} - ${query} - Tài liệu học tập`,
        url: `https://example.org/materials/${query.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Tài liệu học tập về ${query} môn ${subject || ''} dành cho học sinh.`,
        source: 'example.org'
      }
    ];
    
    return results;
  } catch (error) {
    console.error('Error searching educational content:', error);
    throw error;
  }
}

// Thu thập nội dung từ URL
export async function scrapeContentFromUrl(url: string): Promise<ScrapedContent> {
  try {
    // Gửi request đến URL
    const response = await axios.get(url);
    const html = response.data;
    
    // Sử dụng cheerio để phân tích HTML
    const $ = cheerio.load(html);
    
    // Lấy tiêu đề
    const title = $('title').text() || $('h1').first().text() || '';
    
    // Lấy nội dung chính
    // Đây là một triển khai đơn giản, trong thực tế cần phức tạp hơn để lấy đúng nội dung
    let content = '';
    $('article, .content, .main-content, main').each((_, element) => {
      content += $(element).text() + '\n';
    });
    
    // Nếu không tìm thấy nội dung chính, lấy tất cả văn bản
    if (!content) {
      content = $('body').text();
    }
    
    // Lấy URL của các hình ảnh
    const imageUrls: string[] = [];
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        // Chuyển đổi URL tương đối thành URL tuyệt đối
        const absoluteUrl = new URL(src, url).href;
        imageUrls.push(absoluteUrl);
      }
    });
    
    // Lấy tên miền làm nguồn
    const source = new URL(url).hostname;
    
    return {
      title,
      content,
      url,
      source,
      imageUrls
    };
  } catch (error) {
    console.error('Error scraping content from URL:', error);
    throw error;
  }
}

// Tìm kiếm và thu thập nội dung học tập
export async function searchAndScrapeEducationalContent(
  query: string,
  subject?: string,
  grade?: number
): Promise<ScrapedContent[]> {
  try {
    // Tìm kiếm nội dung
    const searchResults = await searchEducationalContent(query, subject, grade);
    
    // Thu thập nội dung từ các kết quả tìm kiếm
    const scrapedContents: ScrapedContent[] = [];
    
    for (const result of searchResults) {
      try {
        const content = await scrapeContentFromUrl(result.url);
        scrapedContents.push(content);
      } catch (error) {
        console.error(`Error scraping content from ${result.url}:`, error);
        // Tiếp tục với URL tiếp theo
      }
    }
    
    return scrapedContents;
  } catch (error) {
    console.error('Error searching and scraping educational content:', error);
    throw error;
  }
}
