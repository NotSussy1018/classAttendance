/**
 * Class Card Component
 * 반 정보를 카드 형태로 표시
 */

import { Class } from '../types/index';

interface ClassCardProps {
  classData: Class;
  studentCount?: number;
  onViewDetails?: (classId: string) => void;
}

export default function ClassCard({
  classData,
  studentCount = 0,
  onViewDetails,
}: ClassCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={() => onViewDetails?.(classData.id)}
    >
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <h3 className="text-2xl font-bold">{classData.name}</h3>
        <p className="text-blue-100 text-sm mt-1">Grade {classData.gradeLevel}</p>
      </div>

      {/* 본문 */}
      <div className="p-6">
        <div className="space-y-4">
          {/* 학생 수 */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">학생 수</span>
            <span className="text-2xl font-bold text-blue-600">
              {studentCount} / {classData.maxStudents}
            </span>
          </div>

          {/* 설명 */}
          {classData.description && (
            <p className="text-gray-600 text-sm">{classData.description}</p>
          )}

          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition"
              style={{ width: `${(studentCount / classData.maxStudents) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <button className="w-full text-blue-600 font-semibold hover:text-blue-700 transition">
          상세 보기 →
        </button>
      </div>
    </div>
  );
}
