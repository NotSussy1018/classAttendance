/**
 * Domain Layer - Type Definitions
 * 모든 도메인 모델의 인터페이스 정의
 */

// User 역할 타입
export type UserRole = 'admin' | 'teacher' | 'student';

// 출석 상태 타입
export type AttendanceStatus = 'present' | 'absent' | 'tardy' | 'excused';

// 학생 활성화 상태
export type StudentStatus = 'active' | 'inactive';

/**
 * 사용자 정보
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId: string;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * 학교 정보
 */
export interface School {
  id: string;
  name: string;
  address: string;
  adminId: string;
  phoneNumber?: string;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * 반 정보
 */
export interface Class {
  id: string;
  schoolId: string;
  name: string; // 예: '1-1', '2-A'
  teacherId: string;
  gradeLevel: number;
  maxStudents: number;
  description?: string;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * 학생 정보
 */
export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  userId: string;
  name: string;
  studentNumber: string;
  email: string;
  status: StudentStatus;
  enrolledAt: FirebaseFirestore.Timestamp | Date;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * 시간대 정보
 */
export interface TimeSlot {
  id: string;
  schoolId: string;
  classId: string;
  dayOfWeek: number; // 0 = 일요일, 1 = 월요일, ... 6 = 토요일
  startTime: string; // HH:mm 형식
  endTime: string; // HH:mm 형식
  subject: string;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * 출석 기록
 */
export interface Attendance {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD 형식
  timeslotId: string;
  status: AttendanceStatus;
  recordedBy: string; // teacherId
  notes?: string;
  recordedAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * 출석률 통계 (캐시)
 * Phase 2에서 사용
 */
export interface AttendanceStats {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  month: string; // YYYY-MM
  totalDays: number;
  presentDays: number;
  tardyDays: number;
  absentDays: number;
  excusedDays: number;
  attendanceRate: number; // 백분율 (0-100)
  lastUpdated: FirebaseFirestore.Timestamp | Date;
}

/**
 * API 요청/응답 타입
 */

// 출석 기록 요청 (일괄)
export interface RecordAttendanceRequest {
  timeslotId: string;
  date: string; // YYYY-MM-DD
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
}

// 개별 출석 기록 요청
export interface RecordSingleAttendanceRequest {
  studentId: string;
  date: string; // YYYY-MM-DD
  timeslotId: string;
  status: AttendanceStatus;
  notes?: string;
}

// 사용자 생성 요청
export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  schoolId: string;
  role: UserRole;
}

// 학교 생성 요청
export interface CreateSchoolRequest {
  name: string;
  address: string;
  phoneNumber?: string;
}

// 반 생성 요청
export interface CreateClassRequest {
  name: string;
  gradeLevel: number;
  maxStudents: number;
  description?: string;
}

// 학생 등록 요청
export interface EnrollStudentRequest {
  userId?: string; // userId가 없으면 studentNumber로 검색
  studentNumber: string;
  name: string;
  email: string;
}

// 시간대 생성 요청
export interface CreateTimeSlotRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
}

// 표준 API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

// 출석 조회 응답
export interface AttendanceResponseItem {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
  recordedAt: number; // timestamp in ms
}

// 반 조회 응답
export interface ClassResponseItem {
  id: string;
  name: string;
  teacherName: string;
  studentCount: number;
}

// 학생 조회 응답
export interface StudentResponseItem {
  id: string;
  userId: string;
  name: string;
  studentNumber: string;
  email: string;
  status: StudentStatus;
}
