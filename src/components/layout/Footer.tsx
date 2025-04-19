'use client';

// src/components/layout/Footer.tsx
// Footer component for the application

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-xl font-bold">
              VietEdu
            </Link>
            <p className="mt-2 text-gray-400 text-sm">
              Nền tảng học tập trực tuyến dành cho học sinh từ lớp 1-9 theo chương trình giáo dục Việt Nam.
            </p>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/subjects" className="text-gray-400 hover:text-white">
                  Môn học
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="text-gray-400 hover:text-white">
                  Bài kiểm tra
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-gray-400 hover:text-white">
                  Đề xuất học tập
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                  Tiến trình học tập
                </Link>
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Môn học</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/subjects?subject=math" className="text-gray-400 hover:text-white">
                  Toán học
                </Link>
              </li>
              <li>
                <Link href="/subjects?subject=english" className="text-gray-400 hover:text-white">
                  Tiếng Anh
                </Link>
              </li>
              <li>
                <Link href="/subjects?subject=physics" className="text-gray-400 hover:text-white">
                  Vật lý
                </Link>
              </li>
              <li>
                <Link href="/subjects?subject=chemistry" className="text-gray-400 hover:text-white">
                  Hóa học
                </Link>
              </li>
              <li>
                <Link href="/subjects?subject=informatics" className="text-gray-400 hover:text-white">
                  Tin học
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>support@vietedu.edu.vn</span>
              </li>
              <li className="flex items-center text-gray-400">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center text-gray-400">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {currentYear} VietEdu. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
