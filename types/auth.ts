export type UserRole = 'admin' | 'investor' | 'client';

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  nationalId: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
  walletBalance: number;
  totalInvested: number;
  totalEarnings: number;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginParams {
  id?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  pin?: string;
}
