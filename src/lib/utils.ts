// src/lib/utils.ts
// Utility functions for the application

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for combining Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility for formatting dates
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Utility for formatting percentages
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// Utility for truncating text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Utility for converting Vietnamese text to slug
export function convertToSlug(text: string): string {
  // Chuyển đổi sang chữ thường và loại bỏ dấu
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    // Thay thế các ký tự không phải chữ cái và số bằng dấu gạch ngang
    .replace(/[^a-z0-9]+/g, "-")
    // Loại bỏ dấu gạch ngang ở đầu và cuối
    .replace(/^-+|-+$/g, "");
  
  return slug;
}
