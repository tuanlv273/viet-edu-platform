// src/lib/auth/auth.ts
// Hệ thống xác thực người dùng

import { User } from '../db/schema';
import { getUserByEmail, getUserByUsername, createUser } from '../db/models/user';
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

// Khóa bí mật cho JWT, trong môi trường thực tế nên lấy từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Interface cho token payload
interface TokenPayload {
  userId: number;
  email: string;
  username: string;
}

// Đăng ký người dùng mới
export async function registerUser(
  username: string,
  email: string,
  password: string,
  fullName: string,
  gradeId?: number
): Promise<{ user: User; token: string }> {
  // Kiểm tra xem email đã tồn tại chưa
  const existingUserByEmail = await getUserByEmail(email);
  if (existingUserByEmail) {
    throw new Error('Email đã được sử dụng');
  }

  // Kiểm tra xem username đã tồn tại chưa
  const existingUserByUsername = await getUserByUsername(username);
  if (existingUserByUsername) {
    throw new Error('Tên đăng nhập đã được sử dụng');
  }

  // Mã hóa mật khẩu
  const hashedPassword = await hash(password, 10);

  // Tạo người dùng mới
  const userId = await createUser({
    username,
    email,
    password_hash: hashedPassword,
    full_name: fullName,
    grade_id: gradeId,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Lấy thông tin người dùng vừa tạo
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Lỗi khi tạo người dùng');
  }

  // Tạo token JWT
  const token = generateToken(user);

  return { user, token };
}

// Đăng nhập
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  // Tìm người dùng theo email
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Kiểm tra trạng thái người dùng
  if (!user.is_active) {
    throw new Error('Tài khoản đã bị vô hiệu hóa');
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Tạo token JWT
  const token = generateToken(user);

  return { user, token };
}

// Xác thực token
export async function verifyToken(token: string): Promise<User> {
  try {
    // Giải mã token
    const decoded = verify(token, JWT_SECRET) as TokenPayload;

    // Tìm người dùng theo ID
    const user = await getUserByEmail(decoded.email);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Kiểm tra trạng thái người dùng
    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    return user;
  } catch (error) {
    throw new Error('Token không hợp lệ');
  }
}

// Tạo token JWT
function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };

  // Tạo token với thời hạn 7 ngày
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
