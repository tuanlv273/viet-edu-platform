// src/app/layout.tsx
// Root layout với AuthProvider

import { AuthProvider } from '@/lib/auth/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Viet-Edu - Nền tảng học tập cho học sinh Việt Nam',
  description: 'Nền tảng học tập trực tuyến dành cho học sinh từ lớp 1-9 theo chương trình giáo dục Việt Nam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
