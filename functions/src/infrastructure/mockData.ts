/**
 * Infrastructure - Mock Data
 * 로컬 개발 및 테스트용 Mock 데이터
 */

import { User, School, Class, Student, TimeSlot, Attendance } from '../domain/types';

// Mock 환경 변수 활성화 여부
export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

// ==================== Mock 사용자 ====================
export const mockUsers: Record<string, User> = {
  'user-teacher-001': {
    uid: 'user-teacher-001',
    email: 'teacher1@school.com',
    displayName: '김교사',
    role: 'teacher',
    schoolId: 'school-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-22'),
  },
  'user-student-001': {
    uid: 'user-student-001',
    email: 'student1@school.com',
    displayName: '이학생',
    role: 'student',
    schoolId: 'school-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-22'),
  },
  'user-student-002': {
    uid: 'user-student-002',
    email: 'student2@school.com',
    displayName: '박학생',
    role: 'student',
    schoolId: 'school-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-22'),
  },
};

// ==================== Mock 학교 ====================
export const mockSchools: Record<string, School> = {
  'school-001': {
    id: 'school-001',
    name: '테스트 중학교',
    address: '서울시 강남구',
    adminId: 'user-teacher-001',
    phoneNumber: '02-1234-5678',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-22'),
  },
};

// ==================== Mock 반 ====================
export const mockClasses: Record<string, Class> = {
  'class-001': {
    id: 'class-001',
    schoolId: 'school-001',
    name: '1-1',
    teacherId: 'user-teacher-001',
    gradeLevel: 1,
    maxStudents: 30,
    description: '1학년 1반',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-22'),
  },
};

// ==================== Mock 학생 ====================
export const mockStudents: Record<string, Student> = {
  'student-001': {
    id: 'student-001',
    schoolId: 'school-001',
    classId: 'class-001',
    userId: 'user-student-001',
    name: '이학생',
    studentNumber: '2024-001',
    email: 'student1@school.com',
    status: 'active',
    enrolledAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-22'),
  },
  'student-002': {
    id: 'student-002',
    schoolId: 'school-001',
    classId: 'class-001',
    userId: 'user-student-002',
    name: '박학생',
    studentNumber: '2024-002',
    email: 'student2@school.com',
    status: 'active',
    enrolledAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-22'),
  },
  'student-003': {
    id: 'student-003',
    schoolId: 'school-001',
    classId: 'class-001',
    userId: 'user-teacher-001', // 교사가 학생으로도 등록됨 (테스트용)
    name: '최학생',
    studentNumber: '2024-003',
    email: 'student3@school.com',
    status: 'active',
    enrolledAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-22'),
  },
};

// ==================== Mock 시간대 ====================
export const mockTimeSlots: Record<string, TimeSlot> = {
  'slot-001': {
    id: 'slot-001',
    schoolId: 'school-001',
    classId: 'class-001',
    dayOfWeek: 1, // 월요일
    startTime: '09:00',
    endTime: '10:00',
    subject: '국어',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-22'),
  },
  'slot-002': {
    id: 'slot-002',
    schoolId: 'school-001',
    classId: 'class-001',
    dayOfWeek: 1, // 월요일
    startTime: '10:00',
    endTime: '11:00',
    subject: '수학',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-22'),
  },
};

// ==================== Mock 출석 ====================
export const mockAttendances: Record<string, Attendance> = {
  'attendance-001': {
    id: 'attendance-001',
    schoolId: 'school-001',
    classId: 'class-001',
    studentId: 'student-001',
    date: '2024-03-22',
    timeslotId: 'slot-001',
    status: 'present',
    recordedBy: 'user-teacher-001',
    recordedAt: new Date('2024-03-22 09:05'),
    updatedAt: new Date('2024-03-22 09:05'),
  },
  'attendance-002': {
    id: 'attendance-002',
    schoolId: 'school-001',
    classId: 'class-001',
    studentId: 'student-002',
    date: '2024-03-22',
    timeslotId: 'slot-001',
    status: 'tardy',
    recordedBy: 'user-teacher-001',
    notes: '10분 지각',
    recordedAt: new Date('2024-03-22 09:10'),
    updatedAt: new Date('2024-03-22 09:10'),
  },
};

/**
 * Mock 데이터 활성화 여부 확인
 */
export function isMockMode(): boolean {
  return USE_MOCK_DATA || process.env.NODE_ENV === 'development';
}

/**
 * 모든 학생 조회 (Mock)
 */
export function getMockStudents(classId?: string, status?: string): Student[] {
  let students = Object.values(mockStudents);

  if (classId) {
    students = students.filter((s) => s.classId === classId);
  }

  if (status) {
    students = students.filter((s) => s.status === status);
  }

  return students;
}

/**
 * 특정 학생 조회 (Mock)
 */
export function getMockStudent(studentId: string): Student | null {
  return mockStudents[studentId] || null;
}

/**
 * 학생 추가 (Mock) - 메모리에만 저장
 */
export function addMockStudent(student: Student): Student {
  mockStudents[student.id] = student;
  return student;
}

/**
 * 학생 정보 수정 (Mock)
 */
export function updateMockStudent(studentId: string, updates: Partial<Student>): Student | null {
  const student = mockStudents[studentId];
  if (!student) return null;

  const updated = { ...student, ...updates, updatedAt: new Date() };
  mockStudents[studentId] = updated;
  return updated;
}

/**
 * 학생 삭제 (Mock)
 */
export function deleteMockStudent(studentId: string): boolean {
  if (!mockStudents[studentId]) return false;
  delete mockStudents[studentId];
  return true;
}

/**
 * Mock 사용자 조회
 */
export function getMockUser(uid: string): User | null {
  return mockUsers[uid] || null;
}

/**
 * Mock 반 조회
 */
export function getMockClass(classId: string): Class | null {
  return mockClasses[classId] || null;
}

/**
 * Mock 학교 조회
 */
export function getMockSchool(schoolId: string): School | null {
  return mockSchools[schoolId] || null;
}

/**
 * Mock 시간대 조회 (특정 반의 모든 시간대)
 */
export function getMockTimeSlots(classId: string): TimeSlot[] {
  return Object.values(mockTimeSlots).filter((slot) => slot.classId === classId);
}

/**
 * Mock 특정 시간대 조회
 */
export function getMockTimeSlot(slotId: string): TimeSlot | null {
  return mockTimeSlots[slotId] || null;
}

/**
 * Mock 시간대 추가
 */
export function addMockTimeSlot(timeSlot: TimeSlot): TimeSlot {
  mockTimeSlots[timeSlot.id] = timeSlot;
  return timeSlot;
}

/**
 * Mock 시간대 수정
 */
export function updateMockTimeSlot(slotId: string, updates: Partial<TimeSlot>): TimeSlot | null {
  const slot = mockTimeSlots[slotId];
  if (!slot) return null;

  const updated = { ...slot, ...updates, updatedAt: new Date() };
  mockTimeSlots[slotId] = updated;
  return updated;
}

/**
 * Mock 시간대 삭제
 */
export function deleteMockTimeSlot(slotId: string): boolean {
  if (!mockTimeSlots[slotId]) return false;
  delete mockTimeSlots[slotId];
  return true;
}

/**
 * Mock 반 목록 조회 (학교별)
 */
export function getMockClasses(schoolId: string): Class[] {
  return Object.values(mockClasses).filter((c) => c.schoolId === schoolId);
}

/**
 * Mock 반 추가
 */
export function addMockClass(mockClass: Class): Class {
  mockClasses[mockClass.id] = mockClass;
  return mockClass;
}

/**
 * Mock 반 수정
 */
export function updateMockClass(classId: string, updates: Partial<Class>): Class | null {
  const mockClass = mockClasses[classId];
  if (!mockClass) return null;

  const updated = { ...mockClass, ...updates, updatedAt: new Date() };
  mockClasses[classId] = updated;
  return updated;
}

/**
 * Mock 반 삭제
 */
export function deleteMockClass(classId: string): boolean {
  if (!mockClasses[classId]) return false;
  delete mockClasses[classId];
  return true;
}

/**
 * Mock 학교 추가
 */
export function addMockSchool(school: School): School {
  mockSchools[school.id] = school;
  return school;
}

/**
 * Mock 학교 수정
 */
export function updateMockSchool(schoolId: string, updates: Partial<School>): School | null {
  const school = mockSchools[schoolId];
  if (!school) return null;

  const updated = { ...school, ...updates, updatedAt: new Date() };
  mockSchools[schoolId] = updated;
  return updated;
}

/**
 * Mock 학교 삭제
 */
export function deleteMockSchool(schoolId: string): boolean {
  if (!mockSchools[schoolId]) return false;
  delete mockSchools[schoolId];
  return true;
}

/**
 * Mock 사용자 추가
 */
export function addMockUser(user: User): User {
  mockUsers[user.uid] = user;
  return user;
}

/**
 * Mock 사용자 수정
 */
export function updateMockUser(uid: string, updates: Partial<User>): User | null {
  const user = mockUsers[uid];
  if (!user) return null;

  const updated = { ...user, ...updates, updatedAt: new Date() };
  mockUsers[uid] = updated;
  return updated;
}

/**
 * Mock 학교별 사용자 조회
 */
export function getMockUsersBySchool(schoolId: string, role?: string): User[] {
  let users = Object.values(mockUsers).filter((u) => u.schoolId === schoolId);

  if (role) {
    users = users.filter((u) => u.role === role);
  }

  return users;
}

/**
 * Mock 출석 기록 조회 (날짜별)
 */
export function getMockAttendancesByDate(classId: string, date: string): Attendance[] {
  return Object.values(mockAttendances).filter((a) => a.classId === classId && a.date === date);
}

/**
 * Mock 학생 출석 조회 (기간별)
 */
export function getMockStudentAttendance(studentId: string, startDate?: string, endDate?: string): Attendance[] {
  let attendance = Object.values(mockAttendances).filter((a) => a.studentId === studentId);

  if (startDate) {
    attendance = attendance.filter((a) => a.date >= startDate);
  }

  if (endDate) {
    attendance = attendance.filter((a) => a.date <= endDate);
  }

  return attendance;
}

/**
 * Mock 출석 추가
 */
export function addMockAttendance(attendance: Attendance): Attendance {
  const id = `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newAttendance = { ...attendance, id };
  mockAttendances[id] = newAttendance;
  return newAttendance;
}

/**
 * Mock 출석 수정
 */
export function updateMockAttendance(attendanceId: string, updates: Partial<Attendance>): Attendance | null {
  const attendance = mockAttendances[attendanceId];
  if (!attendance) return null;

  const updated = { ...attendance, ...updates, updatedAt: new Date() };
  mockAttendances[attendanceId] = updated;
  return updated;
}

/**
 * Mock 출석 삭제
 */
export function deleteMockAttendance(attendanceId: string): boolean {
  if (!mockAttendances[attendanceId]) return false;
  delete mockAttendances[attendanceId];
  return true;
}
