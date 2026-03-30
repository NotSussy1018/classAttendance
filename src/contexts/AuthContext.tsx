'use client';

/**
 * Auth Context
 * 전역 인증 상태 관리
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'admin' | 'student';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 간단한 로컬 검증 (실제로는 백엔드 API 호출)
      if (!email || !password) {
        throw new Error('이메일과 비밀번호를 입력하세요.');
      }

      // Mock 사용자 데이터
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: 'teacher',
      };

      // 로컬 스토리지에 저장
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem(`password_${email}`, password);

      setUser(mockUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 실패';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string, role: string) => {
    setIsLoading(true);
    try {
      // 유효성 검사
      if (!email || !password || !displayName) {
        throw new Error('모든 필드를 입력하세요.');
      }

      if (password.length < 6) {
        throw new Error('비밀번호는 6자 이상이어야 합니다.');
      }

      // 이메일 형식 확인
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('유효한 이메일 주소를 입력하세요.');
      }

      // Mock 사용자 생성
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        displayName,
        role: (role as any) || 'teacher',
      };

      // 로컬 스토리지에 저장
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem(`password_${email}`, password);

      setUser(newUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입 실패';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('password_')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
}
