'use client';

/**
 * Class Details Page
 * 클래스 상세 정보 및 학생 관리
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StudentTable from '../components/StudentTable';
import StudentFormModal from '../components/StudentFormModal';
import TimeSlotList from '../components/TimeSlotList';
import TimeSlotFormModal from '../components/TimeSlotFormModal';
import { StudentAPI, TimeSlotAPI } from '../lib/api';
import { Student, TimeSlot } from '../types/index';

// 환경 설정에서 ID 가져오기 (기본값: mock 데이터)
const getSchoolId = (): string => {
  return import.meta.env.VITE_SCHOOL_ID || 'school-001';
};

export default function ClassDetailsPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId] = useState(getSchoolId());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    if (classId) {
      fetchStudents();
      fetchTimeSlots();
    }
  }, [classId]);

  const fetchTimeSlots = async () => {
    if (!classId) return;

    try {
      const data = await TimeSlotAPI.getTimeSlots(schoolId, classId);
      setTimeSlots(data);
    } catch (err) {
      console.error('Failed to fetch time slots:', err);
      setTimeSlots([]);
    }
  };

  const fetchStudents = async () => {
    if (!classId) return;

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
      await StudentAPI.deleteStudent(schoolId, classId!, studentId);
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

  const handleAddTimeSlot = () => {
    setSelectedTimeSlot(null);
    setIsTimeSlotModalOpen(true);
  };

  const handleEditTimeSlot = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setIsTimeSlotModalOpen(true);
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    if (!confirm('정말 이 시간대를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await TimeSlotAPI.deleteTimeSlot(schoolId, classId!, slotId);
      fetchTimeSlots();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '시간대 삭제에 실패했습니다.';
      setError(errorMsg);
    }
  };

  const handleTimeSlotModalClose = () => {
    setIsTimeSlotModalOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotModalSuccess = () => {
    handleTimeSlotModalClose();
    fetchTimeSlots();
  };

  const activeStudents = students.filter((s) => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ← 뒤로가기
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">클래스 상세 정보</h1>
          <p className="text-gray-600">클래스 ID: {classId}</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">전체 학생</div>
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
            <div className="text-xs text-gray-500 mt-2">명</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">활성 학생</div>
            <div className="text-3xl font-bold text-green-600">{activeStudents}</div>
            <div className="text-xs text-gray-500 mt-2">명</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">비활성 학생</div>
            <div className="text-3xl font-bold text-gray-600">
              {students.length - activeStudents}
            </div>
            <div className="text-xs text-gray-500 mt-2">명</div>
          </div>
        </div>

        {/* 학생 목록 섹션 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">등록된 학생</h2>
              <button
                onClick={handleAddStudent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                + 학생 추가
              </button>
            </div>
            <div className="overflow-hidden">
              <StudentTable
                students={students}
                loading={loading}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
              />
            </div>
          </div>
        </section>

        {/* 시간대 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">시간표</h2>
            <button
              onClick={handleAddTimeSlot}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
            >
              + 시간대 추가
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <TimeSlotList
              timeSlots={timeSlots}
              loading={loading}
              onAdd={handleAddTimeSlot}
              onEdit={handleEditTimeSlot}
              onDelete={handleDeleteTimeSlot}
            />
          </div>
        </section>
      </div>

      {/* 학생 추가/편집 모달 */}
      {classId && (
        <StudentFormModal
          isOpen={isFormModalOpen}
          onClose={handleFormModalClose}
          student={selectedStudent}
          schoolId={schoolId}
          classId={classId}
          onSuccess={handleFormModalSuccess}
        />
      )}

      {/* 시간대 추가/편집 모달 */}
      {classId && (
        <TimeSlotFormModal
          isOpen={isTimeSlotModalOpen}
          onClose={handleTimeSlotModalClose}
          slot={selectedTimeSlot}
          schoolId={schoolId}
          classId={classId}
          onSuccess={handleTimeSlotModalSuccess}
        />
      )}
    </div>
  );
}
