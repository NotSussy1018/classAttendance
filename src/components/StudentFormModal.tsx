'use client';

/**
 * Student Form Modal
 * 학생 추가/편집 모달
 */

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Student } from '../types/index';
import { StudentAPI } from '../lib/api';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  schoolId: string;
  classId: string;
  onSuccess: () => void;
}

export default function StudentFormModal({
  isOpen,
  onClose,
  student,
  schoolId,
  classId,
  onSuccess,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    studentNumber: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 학생 데이터 초기화
  useEffect(() => {
    if (student) {
      setFormData({
        userId: student.userId,
        name: student.name,
        studentNumber: student.studentNumber,
        email: student.email,
      });
    } else {
      setFormData({
        userId: '',
        name: '',
        studentNumber: '',
        email: '',
      });
    }
    setError(null);
  }, [student, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (student) {
        // 기존 학생 수정
        await StudentAPI.updateStudent(schoolId, classId, student.id, {
          name: formData.name,
          studentNumber: formData.studentNumber,
          email: formData.email,
        });
      } else {
        // 새 학생 추가
        await StudentAPI.enrollStudent(
          schoolId,
          classId,
          formData.userId,
          formData.name,
          formData.studentNumber,
          formData.email
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={student ? '학생 정보 수정' : '새 학생 등록'}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </>
      }
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!student && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사용자 ID</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="user-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="학생 이름"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
          <input
            type="text"
            name="studentNumber"
            value={formData.studentNumber}
            onChange={handleChange}
            placeholder="2024-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@school.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
}
