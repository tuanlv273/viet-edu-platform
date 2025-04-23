// src/app/api/auth/register-with-role/route.ts
// API route để đăng ký người dùng với vai trò cụ thể

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/auth';
import { assignRoleToUser } from '@/lib/db/models/user';
import { getOne } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, fullName, gradeId, roleName } = body;
    
    // Validate input
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Đăng ký người dùng
    const { user, token } = await registerUser(
      username,
      email,
      password,
      fullName,
      gradeId
    );
    
    // Nếu có yêu cầu vai trò cụ thể
    if (roleName) {
      // Lấy ID của vai trò từ tên
      const roleQuery = `SELECT id FROM roles WHERE name = ?`;
      const role = await getOne(roleQuery, [roleName]);
      
      if (!role) {
        return NextResponse.json(
          { error: 'Vai trò không tồn tại' },
          { status: 400 }
        );
      }
      
      // Gán vai trò cho người dùng
      await assignRoleToUser(user.id, role.id);
    } else {
      // Mặc định gán vai trò 'student'
      const roleQuery = `SELECT id FROM roles WHERE name = 'student'`;
      const role = await getOne(roleQuery, ['student']);
      
      if (role) {
        await assignRoleToUser(user.id, role.id);
      }
    }
    
    // Thiết lập cookie xác thực
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        gradeId: user.grade_id
      }
    });
    
    // Thiết lập cookie
    response.cookies.set({
      name: 'viet-edu-auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi đăng ký' },
      { status: 500 }
    );
  }
}
