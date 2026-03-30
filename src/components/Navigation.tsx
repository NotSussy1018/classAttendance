'use client';

/**
 * Navigation Component
 * 상단 네비게이션 바
 */

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center hover:opacity-80 transition"
          >
            <span className="text-2xl font-bold text-blue-600">📚 SAT</span>
            <span className="ml-2 text-sm text-gray-600">School Attendance Tracker</span>
          </button>

          {/* 메뉴 - 인증된 경우만 표시 */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Dashboard
              </button>
              <a href="#classes" className="text-gray-600 hover:text-blue-600 transition">
                Classes
              </a>
              <a href="#students" className="text-gray-600 hover:text-blue-600 transition">
                Students
              </a>
              <a href="#reports" className="text-gray-600 hover:text-blue-600 transition">
                Reports
              </a>
            </div>
          )}

          {/* 우측 버튼 영역 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                {/* 사용자 프로필 버튼 */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-lg">👤</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </button>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
