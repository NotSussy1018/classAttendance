'use client';

/**
 * Dashboard Page
 * 메인 대시보드 - 통계, 클래스, 학생 정보 표시
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroSection from '../components/HeroSection';
import StatCard from '../components/StatCard';
import ClassCard from '../components/ClassCard';
import StudentTable from '../components/StudentTable';
import StudentFormModal from '../components/StudentFormModal';
import { StudentAPI } from '../lib/api';
import { Student } from '../types/index';

// 환경 설정에서 ID 가져오기 (기본값: mock 데이터)
const getSchoolId = (): string => {
  return import.meta.env.VITE_SCHOOL_ID || 'school-001';
};

const getClassId = (): string => {
  return import.meta.env.VITE_CLASS_ID || 'class-001';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId] = useState(getSchoolId());
  const [classId] = useState(getClassId());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [schoolId, classId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StudentAPI.getClassStudents(schoolId, classId);
      setStudents(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '학생 데이터를 불러오지 못했습니다.';
      setError(errorMsg);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsFormModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('정말 이 학생을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await StudentAPI.deleteStudent(schoolId, classId, studentId);
      fetchStudents();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '학생 삭제에 실패했습니다.';
      setError(errorMsg);
    }
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedStudent(null);
  };

  const handleFormModalSuccess = () => {
    handleFormModalClose();
    fetchStudents();
  };

  const handleViewClassDetails = (classIdParam: string) => {
    navigate(`/classes/${classIdParam}`);
  };

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const attendanceRate = students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-20 bg-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-blue-100 mb-2">어서오세요!</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {user ? `${user.displayName}님의 출석 현황` : 'School Attendance Tracker'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              학생 출석 관리를 쉽고 효율적으로
            </p>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* 통계 섹션 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">전체 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon="👥"
              title="전체 학생"
              value={students.length}
              description="등록된 학생 수"
              color="blue"
            />
            <StatCard
              icon="✅"
              title="현황 학생"
              value={activeStudents}
              description="재학 중인 학생"
              color="green"
            />
            <StatCard
              icon="📊"
              title="출석률"
              value={`${attendanceRate}%`}
              description="재학생 비율"
              color="purple"
            />
            <StatCard
              icon="📚"
              title="반"
              value="1"
              description="현재 클래스"
              color="orange"
            />
          </div>
        </section>

        {/* 클래스 섹션 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">클래스</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ClassCard
              classData={{
                id: classId,
                schoolId: schoolId,
                name: '1-1',
                teacherId: 'user-teacher-001',
                gradeLevel: 1,
                maxStudents: 30,
                description: '1학년 1반',
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              studentCount={activeStudents}
              onViewDetails={handleViewClassDetails}
            />
          </div>
        </section>

        {/* 학생 목록 섹션 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">학생 목록</h2>
            <button
              onClick={handleAddStudent}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + 학생 추가
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <StudentTable
              students={students}
              loading={loading}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          </div>
        </section>

        {/* 학생 추가/편집 모달 */}
        <StudentFormModal
          isOpen={isFormModalOpen}
          onClose={handleFormModalClose}
          student={selectedStudent}
          schoolId={schoolId}
          classId={classId}
          onSuccess={handleFormModalSuccess}
        />
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p>&copy; 2024 School Attendance Tracker. All rights reserved.</p>
            <div className="space-x-6">
              <a href="#" className="hover:text-blue-400">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-400">
                Terms
              </a>
              <a href="#" className="hover:text-blue-400">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
