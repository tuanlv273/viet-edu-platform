// src/lib/ai/aiService.ts
// Service để tích hợp với các API của OpenAI và Google AI

export interface AIProvider {
  name: 'openai' | 'googleai';
  model: string;
}

export interface ContentGenerationParams {
  provider: AIProvider;
  contentType: 'lesson' | 'quiz';
  subject: string;
  grade: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export interface AnalysisParams {
  provider: AIProvider;
  studentId: string;
  subject: string;
  timeRange: 'week' | 'month' | 'semester' | 'year';
}

/**
 * Tạo prompt cho việc sinh nội dung học tập
 */
export function createContentGenerationPrompt(params: ContentGenerationParams): string {
  const { contentType, subject, grade, topic, difficulty } = params;
  
  const contentTypeName = contentType === 'lesson' ? 'bài học' : 'bài kiểm tra';
  const difficultyName = 
    difficulty === 'basic' ? 'cơ bản' : 
    difficulty === 'intermediate' ? 'trung bình' : 'nâng cao';
  
  return `Tạo ${contentTypeName} về chủ đề "${topic}" cho môn ${subject} lớp ${grade} với độ khó ${difficultyName} theo chương trình giáo dục Việt Nam.
  
${contentType === 'lesson' ? `Bài học cần có các phần:
- Mục tiêu bài học
- Nội dung bài học (giới thiệu, khái niệm cơ bản, phương pháp giải quyết)
- Ví dụ minh họa
- Bài tập thực hành
- Tổng kết` : `Bài kiểm tra cần có:
- 10 câu hỏi trắc nghiệm với 4 lựa chọn mỗi câu
- Độ khó phù hợp với cấp độ ${difficultyName}
- Đáp án cho từng câu hỏi
- Thời gian làm bài đề xuất`}

Định dạng nội dung theo Markdown.`;
}

/**
 * Tạo prompt cho việc phân tích dữ liệu học tập
 */
export function createLearningAnalysisPrompt(params: AnalysisParams): string {
  const { studentId, subject, timeRange } = params;
  
  const timeRangeText = 
    timeRange === 'week' ? 'tuần qua' : 
    timeRange === 'month' ? 'tháng qua' : 
    timeRange === 'semester' ? 'học kỳ này' : 'năm học này';
  
  const subjectText = subject === 'all' ? 'tất cả các môn học' : `môn ${subject}`;
  
  return `Phân tích dữ liệu học tập của học sinh có ID ${studentId} trong ${timeRangeText} cho ${subjectText}.

Báo cáo phân tích cần bao gồm:
1. Tổng quan về tiến trình học tập
2. Điểm mạnh và điểm yếu
3. Phân tích chi tiết theo môn học (điểm trung bình, chủ đề mạnh/yếu, xu hướng)
4. Đề xuất cải thiện (chủ đề cần tăng cường, phương pháp học tập, lộ trình học tập cá nhân hóa)
5. Dự đoán kết quả nếu tuân theo đề xuất
6. Kết luận

Định dạng báo cáo theo Markdown.`;
}

/**
 * Gọi API của OpenAI để sinh nội dung hoặc phân tích
 * Lưu ý: Trong triển khai thực tế, cần thêm API key và xử lý lỗi
 */
export async function callOpenAI(prompt: string, model: string): Promise<string> {
  try {
    // Mô phỏng gọi API OpenAI
    console.log(`Calling OpenAI API with model ${model}`);
    console.log(`Prompt: ${prompt}`);
    
    // Trong triển khai thực tế, đây sẽ là một API call đến OpenAI
    // Ví dụ:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are an educational content creator for Vietnamese curriculum.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    */
    
    // Mô phỏng thời gian chờ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trả về nội dung mẫu
    return "Nội dung được sinh bởi OpenAI sẽ xuất hiện ở đây.";
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Lỗi khi gọi API OpenAI');
  }
}

/**
 * Gọi API của Google AI để sinh nội dung hoặc phân tích
 * Lưu ý: Trong triển khai thực tế, cần thêm API key và xử lý lỗi
 */
export async function callGoogleAI(prompt: string, model: string): Promise<string> {
  try {
    // Mô phỏng gọi API Google AI
    console.log(`Calling Google AI API with model ${model}`);
    console.log(`Prompt: ${prompt}`);
    
    // Trong triển khai thực tế, đây sẽ là một API call đến Google AI
    // Ví dụ:
    /*
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GOOGLE_AI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7
        }
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    */
    
    // Mô phỏng thời gian chờ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trả về nội dung mẫu
    return "Nội dung được sinh bởi Google AI sẽ xuất hiện ở đây.";
  } catch (error) {
    console.error('Error calling Google AI API:', error);
    throw new Error('Lỗi khi gọi API Google AI');
  }
}

/**
 * Sinh nội dung học tập (bài học hoặc bài kiểm tra)
 */
export async function generateContent(params: ContentGenerationParams): Promise<string> {
  try {
    const prompt = createContentGenerationPrompt(params);
    
    if (params.provider.name === 'openai') {
      return await callOpenAI(prompt, params.provider.model);
    } else {
      return await callGoogleAI(prompt, params.provider.model);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

/**
 * Phân tích dữ liệu học tập
 */
export async function analyzeLearningData(params: AnalysisParams): Promise<string> {
  try {
    const prompt = createLearningAnalysisPrompt(params);
    
    if (params.provider.name === 'openai') {
      return await callOpenAI(prompt, params.provider.model);
    } else {
      return await callGoogleAI(prompt, params.provider.model);
    }
  } catch (error) {
    console.error('Error analyzing learning data:', error);
    throw error;
  }
}
