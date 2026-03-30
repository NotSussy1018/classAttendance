/**
 * Domain Layer - Constants
 * 상수, 에러 코드, 메시지 정의
 */

// User 역할 상수
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

// 출석 상태 상수
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  TARDY: 'tardy',
  EXCUSED: 'excused',
} as const;

// 학생 활성화 상태
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// 요일 상수
export const DAY_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

// 에러 코드
export const ERROR_CODES = {
  // 인증 및 권한
  AUTH_MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',

  // 리소스 관련
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_STATE: 'INVALID_STATE',

  // 비즈니스 로직
  CLASS_FULL: 'CLASS_FULL',
  STUDENT_ALREADY_ENROLLED: 'STUDENT_ALREADY_ENROLLED',
  DUPLICATE_TIMESLOT: 'DUPLICATE_TIMESLOT',
  INVALID_ATTENDANCE_DATE: 'INVALID_ATTENDANCE_DATE',

  // 서버 에러
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_MISSING_TOKEN]: '인증 토큰이 없습니다.',
  [ERROR_CODES.AUTH_INVALID_TOKEN]: '유효하지 않은 인증 토큰입니다.',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: '인증이 필요합니다.',
  [ERROR_CODES.AUTH_FORBIDDEN]: '접근 권한이 없습니다.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',

  [ERROR_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_CODES.ALREADY_EXISTS]: '이미 존재하는 리소스입니다.',
  [ERROR_CODES.INVALID_INPUT]: '유효하지 않은 입력입니다.',
  [ERROR_CODES.INVALID_STATE]: '유효하지 않은 상태입니다.',

  [ERROR_CODES.CLASS_FULL]: '반이 가득 찼습니다.',
  [ERROR_CODES.STUDENT_ALREADY_ENROLLED]: '이미 등록된 학생입니다.',
  [ERROR_CODES.DUPLICATE_TIMESLOT]: '중복된 시간대입니다.',
  [ERROR_CODES.INVALID_ATTENDANCE_DATE]: '유효하지 않은 출석 날짜입니다.',

  [ERROR_CODES.INTERNAL_ERROR]: '내부 서버 오류가 발생했습니다.',
  [ERROR_CODES.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [ERROR_CODES.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
} as const;

// Firestore Collection 경로
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  SCHOOLS: 'schools',
  CLASSES: (schoolId: string) => `schools/${schoolId}/classes`,
  STUDENTS: (schoolId: string, classId: string) => `schools/${schoolId}/classes/${classId}/students`,
  TIMESLOTS: (schoolId: string, classId: string) => `schools/${schoolId}/classes/${classId}/timeslots`,
  ATTENDANCES: (schoolId: string, classId: string) => `schools/${schoolId}/classes/${classId}/attendances`,
  ATTENDANCE_STATS: (schoolId: string, classId: string) =>
    `schools/${schoolId}/classes/${classId}/attendanceStats`,
} as const;

// 공통 상수
export const CONSTANTS = {
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT_MS: 30000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
