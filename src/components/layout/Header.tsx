'use client';

// src/components/layout/Header.tsx
// Header component for the application

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            VietEdu
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/subjects" className="hover:text-blue-200">
              Môn học
            </Link>
            <Link href="/quizzes" className="hover:text-blue-200">
              Bài kiểm tra
            </Link>
            <Link href="/recommendations" className="hover:text-blue-200">
              Đề xuất
            </Link>
            {user && (
              <Link href="/dashboard" className="hover:text-blue-200">
                Tiến trình
              </Link>
            )}
            {user && user.role === 'admin' && (
              <>
                <Link href="/admin" className="hover:text-blue-200">
                  Quản trị
                </Link>
                <Link href="/ai-integration" className="hover:text-blue-200">
                  AI
                </Link>
              </>
            )}
          </nav>

          {/* Auth buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="hover:text-blue-200 flex items-center"
                >
                  <span className="mr-2">{user.name || user.email}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={logout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="hover:text-blue-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <div className="flex flex-col space-y-3">
              <Link
                href="/subjects"
                className="hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Môn học
              </Link>
              <Link
                href="/quizzes"
                className="hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bài kiểm tra
              </Link>
              <Link
                href="/recommendations"
                className="hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đề xuất
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="hover:text-blue-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tiến trình
                </Link>
              )}
              {user && user.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className="hover:text-blue-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Quản trị
                  </Link>
                  <Link
                    href="/ai-integration"
                    className="hover:text-blue-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    AI
                  </Link>
                </>
              )}
              {user ? (
                <div className="flex flex-col space-y-3 pt-3 border-t border-blue-500">
                  <Link
                    href="/profile"
                    className="hover:text-blue-200 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{user.name || user.email}</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-left"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-blue-500">
                  <Link
                    href="/auth/login"
                    className="hover:text-blue-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
