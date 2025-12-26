import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import { AuthJwtPayload, generateToken } from '../utils/jwt';
import type { User as DbUser } from '../generated/prisma/client';
import { isRole, type Role } from '../types/user';

export type PublicUser = Omit<DbUser, 'password'>;

export async function login(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  if (!isRole(user.role)) throw ApiError.internal('Invalid user role');
  const role = user.role.trim().toUpperCase() as Role;
  const payload: AuthJwtPayload = { userId: user.id, email: user.email, role };

  const token = generateToken(payload, { expiresIn: '1d' });
  const { password: _password, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function register(data: Pick<DbUser, 'fullName' | 'email'> & { role: string; password: string }): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict('Email already exists');

  if (!isRole(data.role)) throw ApiError.badRequest('Invalid role');
  const role = data.role.trim().toUpperCase() as Role;

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      ...data,
      role,
      password: hashedPassword,
    },
  });
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
