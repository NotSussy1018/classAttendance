/**
 * 타입 정의
 */

export interface School {
  id: string;
  name: string;
  address: string;
  adminId: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  teacherId: string;
  gradeLevel: number;
  maxStudents: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  userId: string;
  name: string;
  studentNumber: string;
  email: string;
  status: 'active' | 'inactive' | 'graduated';
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  schoolId: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  date: string;
  timeslotId: string;
  status: 'present' | 'absent' | 'tardy' | 'excused';
  recordedBy: string;
  notes?: string;
  recordedAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
