import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import { AuthJwtPayload, generateToken } from '../utils/jwt';
import type { users as DbUser } from '../generated/prisma';

export type PublicUser = Omit<DbUser, 'password'>;

export async function login(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const payload: AuthJwtPayload = { userId: user.id, email: user.email, role: user.role };
  
  const token = generateToken(payload, { expiresIn: '1d' });
  const { password: _password, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function register(data: Pick<DbUser, 'full_name' | 'email' | 'role'> & { password: string }): Promise<PublicUser> {
  const existing = await prisma.users.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict('Email already exists');

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.users.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
