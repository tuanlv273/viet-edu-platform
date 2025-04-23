// src/app/page.tsx
// Trang chủ của ứng dụng

import Link from 'next/link';
import { getAllSubjects } from '@/lib/db/models/subject';
import { Subject } from '@/lib/db/schema';

export default async function HomePage() {
  const subjects: Subject[] = await getAllSubjects();
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Nền tảng học tập trực tuyến cho học sinh Việt Nam</h1>
              <p className="text-xl mb-8">Hỗ trợ học sinh từ lớp 1-9 với nội dung phù hợp theo chương trình giáo dục Việt Nam</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/auth/register" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
                >
                  Đăng ký miễn phí
                </Link>
                <Link 
                  href="/subjects" 
                  className="bg-blue-500 hover:bg-blue-400 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
                >
                  Khám phá bài học
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Các môn học</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[
                { name: 'Toán', icon: '📊', color: 'bg-red-100 text-red-600' },
              ].length === 0 ? subjects.map((subject) => (
                <Link 
                  key={subject.id}
                  href={`/subjects/${subject.slug}`}
                  className={`${subject.color} rounded-xl p-6 text-center hover:shadow-md transition-shadow`}
                >
                  {/* eslint-disable-next-line react/no-unescaped-entities */}

                  <div className="text-4xl mb-3">{subject.icon}</div>
                  <h3 className="text-xl font-semibold">{subject.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Nội dung theo chương trình',
                  description: 'Bài học và bài kiểm tra được thiết kế phù hợp với chương trình giáo dục Việt Nam',
                  icon: '📚'
                },
                {
                  title: 'Bài kiểm tra đa dạng',
                  description: 'Hệ thống bài kiểm tra từ cơ bản đến nâng cao, giúp đánh giá và cải thiện kiến thức',
                  icon: '✅'
                },
                {
                  title: 'Theo dõi tiến trình',
                  description: 'Hệ thống theo dõi và thống kê tiến trình học tập chi tiết',
                  icon: '📈'
                },
                {
                  title: 'Lộ trình cá nhân hóa',
                  description: 'Gợi ý lộ trình học tập phù hợp với trình độ và nhu cầu của từng học sinh',
                  icon: '🧭'
                },
                {
                  title: 'Tương thích đa thiết bị',
                  description: 'Trải nghiệm học tập mượt mà trên máy tính, máy tính bảng và điện thoại',
                  icon: '📱'
                },
                {
                  title: 'Cập nhật liên tục',
                  description: 'Nội dung học tập được cập nhật thường xuyên từ các nguồn giáo dục uy tín',
                  icon: '🔄'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Sẵn sàng bắt đầu hành trình học tập?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay để trải nghiệm nền tảng học tập toàn diện dành cho học sinh Việt Nam
            </p>
            <Link 
              href="/auth/register" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium text-lg inline-block transition-colors"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Viet-Edu</h3>
              <p className="text-gray-400">Nền tảng học tập trực tuyến hàng đầu cho học sinh Việt Nam từ lớp 1-9</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">Giới thiệu</Link></li>
                <li><Link href="/subjects" className="text-gray-400 hover:text-white">Môn học</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Học phí</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-white">Trung tâm trợ giúp</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Điều khoản sử dụng</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Chính sách bảo mật</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@viet-edu.vn</li>
                <li>Điện thoại: (84) 123 456 789</li>
                <li>Địa chỉ: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Viet-Edu. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
