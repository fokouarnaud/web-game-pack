export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  voiceEnabled: boolean;
  difficultyLevel: DifficultyLevel;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  difficultyLevel?: DifficultyLevel;
  voiceEnabled?: boolean;
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}