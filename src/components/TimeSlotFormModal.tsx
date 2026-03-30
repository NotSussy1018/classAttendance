'use client';

/**
 * Time Slot Form Modal
 * 시간대 추가/편집 모달
 */

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { TimeSlot } from '../types/index';
import { TimeSlotAPI } from '../lib/api';

const DAY_OPTIONS = [
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
  { value: 0, label: '일요일' },
];

interface TimeSlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot?: TimeSlot | null;
  schoolId: string;
  classId: string;
  onSuccess: () => void;
}

export default function TimeSlotFormModal({
  isOpen,
  onClose,
  slot,
  schoolId,
  classId,
  onSuccess,
}: TimeSlotFormModalProps) {
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (slot) {
      setFormData({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject,
      });
    } else {
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        subject: '',
      });
    }
    setError(null);
  }, [slot, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dayOfWeek' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.subject) {
      setError('과목명을 입력해주세요.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('종료 시간이 시작 시간보다 늦어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      if (slot) {
        // 기존 시간대 수정
        await TimeSlotAPI.updateTimeSlot(schoolId, classId, slot.id, {
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          subject: formData.subject,
        });
      } else {
        // 새 시간대 생성
        await TimeSlotAPI.createTimeSlot(
          schoolId,
          classId,
          formData.dayOfWeek,
          formData.startTime,
          formData.endTime,
          formData.subject
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
      title={slot ? '시간대 수정' : '새 시간대 등록'}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
          <select
            name="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {DAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">과목명</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="예: 수학, 영어, 과학"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
}
