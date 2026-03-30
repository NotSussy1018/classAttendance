/**
 * Infrastructure Layer - Input Validators
 * 입력 데이터 검증 유틸
 */

import { ValidationError } from '../domain/errors';
import {
  USER_ROLES,
  ATTENDANCE_STATUS,
  DAY_OF_WEEK,
  STUDENT_STATUS,
  ERROR_CODES,
} from '../domain/constants';

/**
 * 이메일 검증
 */
export function validateEmail(email: string): void {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('이메일이 필요합니다.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('유효한 이메일 형식이 아닙니다.', { email });
  }
}

/**
 * 비밀번호 검증
 */
export function validatePassword(password: string): void {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('비밀번호가 필요합니다.');
  }

  if (password.length < 6) {
    throw new ValidationError('비밀번호는 최소 6자 이상이어야 합니다.');
  }
}

/**
 * 사용자 이름 검증
 */
export function validateDisplayName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('이름이 필요합니다.');
  }

  if (name.trim().length === 0) {
    throw new ValidationError('이름은 공백만으로 이루어질 수 없습니다.');
  }

  if (name.length > 100) {
    throw new ValidationError('이름은 100자 이하여야 합니다.');
  }
}

/**
 * 역할 검증
 */
export function validateUserRole(role: any): void {
  if (!role || !Object.values(USER_ROLES).includes(role)) {
    throw new ValidationError('유효하지 않은 사용자 역할입니다.', { role });
  }
}

/**
 * 출석 상태 검증
 */
export function validateAttendanceStatus(status: any): void {
  if (!status || !Object.values(ATTENDANCE_STATUS).includes(status)) {
    throw new ValidationError('유효하지 않은 출석 상태입니다.', { status });
  }
}

/**
 * 날짜 검증 (YYYY-MM-DD 형식)
 */
export function validateDateFormat(date: string): void {
  if (!date || typeof date !== 'string') {
    throw new ValidationError('날짜가 필요합니다.');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', { date });
  }

  // 유효한 날짜인지 확인
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError('유효하지 않은 날짜입니다.', { date });
  }
}

/**
 * 시간 형식 검증 (HH:mm)
 */
export function validateTimeFormat(time: string): void {
  if (!time || typeof time !== 'string') {
    throw new ValidationError('시간이 필요합니다.');
  }

  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new ValidationError('시간 형식이 올바르지 않습니다. (HH:mm)', { time });
  }
}

/**
 * 요일 검증 (0-6)
 */
export function validateDayOfWeek(day: any): void {
  if (typeof day !== 'number' || day < 0 || day > 6) {
    throw new ValidationError('요일이 유효하지 않습니다. (0-6)', { day });
  }
}

/**
 * 학교 ID 검증
 */
export function validateSchoolId(schoolId: string): void {
  if (!schoolId || typeof schoolId !== 'string' || schoolId.trim().length === 0) {
    throw new ValidationError('유효한 학교 ID가 필요합니다.', { schoolId });
  }
}

/**
 * 반 ID 검증
 */
export function validateClassId(classId: string): void {
  if (!classId || typeof classId !== 'string' || classId.trim().length === 0) {
    throw new ValidationError('유효한 반 ID가 필요합니다.', { classId });
  }
}

/**
 * 학생 ID 검증
 */
export function validateStudentId(studentId: string): void {
  if (!studentId || typeof studentId !== 'string' || studentId.trim().length === 0) {
    throw new ValidationError('유효한 학생 ID가 필요합니다.', { studentId });
  }
}

/**
 * 사용자 ID 검증
 */
export function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new ValidationError('유효한 사용자 ID가 필요합니다.', { userId });
  }
}

/**
 * 시간대 ID 검증
 */
export function validateTimeSlotId(slotId: string): void {
  if (!slotId || typeof slotId !== 'string' || slotId.trim().length === 0) {
    throw new ValidationError('유효한 시간대 ID가 필요합니다.', { slotId });
  }
}

/**
 * 반 이름 검증
 */
export function validateClassName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('반 이름이 필요합니다.');
  }

  if (name.trim().length === 0) {
    throw new ValidationError('반 이름은 공백만으로 이루어질 수 없습니다.');
  }

  if (name.length > 50) {
    throw new ValidationError('반 이름은 50자 이하여야 합니다.');
  }
}

/**
 * 학년 검증
 */
export function validateGradeLevel(grade: any): void {
  if (typeof grade !== 'number' || grade < 1 || grade > 12) {
    throw new ValidationError('유효한 학년이 아닙니다. (1-12)', { grade });
  }
}

/**
 * 최대 학생 수 검증
 */
export function validateMaxStudents(max: any): void {
  if (typeof max !== 'number' || max < 1 || max > 100) {
    throw new ValidationError('최대 학생 수는 1-100 사이여야 합니다.', { max });
  }
}

/**
 * 학번 검증
 */
export function validateStudentNumber(studentNumber: string): void {
  if (!studentNumber || typeof studentNumber !== 'string') {
    throw new ValidationError('학번이 필요합니다.');
  }

  if (studentNumber.trim().length === 0) {
    throw new ValidationError('학번은 공백만으로 이루어질 수 없습니다.');
  }

  if (studentNumber.length > 20) {
    throw new ValidationError('학번은 20자 이하여야 합니다.');
  }
}

/**
 * 과목명 검증
 */
export function validateSubject(subject: string): void {
  if (!subject || typeof subject !== 'string') {
    throw new ValidationError('과목명이 필요합니다.');
  }

  if (subject.trim().length === 0) {
    throw new ValidationError('과목명은 공백만으로 이루어질 수 없습니다.');
  }

  if (subject.length > 50) {
    throw new ValidationError('과목명은 50자 이하여야 합니다.');
  }
}

/**
 * 학교명 검증
 */
export function validateSchoolName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('학교명이 필요합니다.');
  }

  if (name.trim().length === 0) {
    throw new ValidationError('학교명은 공백만으로 이루어질 수 없습니다.');
  }

  if (name.length > 100) {
    throw new ValidationError('학교명은 100자 이하여야 합니다.');
  }
}

/**
 * 주소 검증
 */
export function validateAddress(address: string): void {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('주소가 필요합니다.');
  }

  if (address.trim().length === 0) {
    throw new ValidationError('주소는 공백만으로 이루어질 수 없습니다.');
  }

  if (address.length > 200) {
    throw new ValidationError('주소는 200자 이하여야 합니다.');
  }
}

/**
 * 선택적 필드 검증 헬퍼
 */
export function validateOptionalString(value: any, fieldName: string, maxLength = 500): void {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName}은 문자열이어야 합니다.`);
    }

    if (value.length > maxLength) {
      throw new ValidationError(`${fieldName}은 ${maxLength}자 이하여야 합니다.`);
    }
  }
}
