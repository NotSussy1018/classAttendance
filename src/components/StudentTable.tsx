/**
 * Student Table Component
 * 학생 목록을 테이블 형태로 표시
 */

import { Student } from '../types/index';

interface StudentTableProps {
  students: Student[];
  loading?: boolean;
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
}

const statusColorMap = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  graduated: 'bg-blue-100 text-blue-800',
};

const statusTextMap = {
  active: '재학',
  inactive: '휴학',
  graduated: '졸업',
};

export default function StudentTable({
  students,
  loading = false,
  onEdit,
  onDelete,
}: StudentTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="sr-only">로딩 중...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12" role="status">
        <p className="text-gray-600 text-lg">등록된 학생이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table" aria-label="학생 목록">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900" scope="col">
              이름
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900" scope="col">
              학번
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900" scope="col">
              이메일
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900" scope="col">
              상태
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900" scope="col">
              등록일
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900" scope="col">
              작업
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
              role="row"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.studentNumber}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColorMap[student.status] || statusColorMap.active
                  }`}
                  aria-label={`상태: ${statusTextMap[student.status] || '알 수 없음'}`}
                >
                  {statusTextMap[student.status] || '알 수 없음'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(student.enrolledAt).toLocaleDateString('ko-KR')}
              </td>
              <td className="px-6 py-4 text-right text-sm space-x-2">
                <button
                  onClick={() => onEdit?.(student)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  aria-label={`${student.name} 학생 정보 수정`}
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete?.(student.id)}
                  className="text-red-600 hover:text-red-700 font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                  aria-label={`${student.name} 학생 삭제`}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
