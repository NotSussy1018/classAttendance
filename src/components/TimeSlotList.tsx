'use client';

/**
 * Time Slot List Component
 * 시간대 목록 표시 및 관리
 */

import { TimeSlot } from '../types/index';

interface TimeSlotListProps {
  timeSlots: TimeSlot[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (slot: TimeSlot) => void;
  onDelete?: (slotId: string) => void;
}

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export default function TimeSlotList({
  timeSlots,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}: TimeSlotListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">등록된 시간대가 없습니다.</p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + 시간대 추가
          </button>
        )}
      </div>
    );
  }

  // Group time slots by day of week
  const slotsByDay = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push(slot);
      return acc;
    },
    {} as Record<number, TimeSlot[]>
  );

  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 0].map((day) => (
        <div key={day} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-900">
            {DAY_NAMES[day]}
          </div>
          <div className="divide-y divide-gray-200">
            {slotsByDay[day] ? (
              slotsByDay[day].map((slot) => (
                <div key={slot.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {slot.startTime} ~ {slot.endTime}
                    </div>
                    <div className="text-sm text-gray-600">{slot.subject}</div>
                  </div>
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(slot)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                      >
                        수정
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(slot.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">등록된 시간대 없음</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
