/**
 * Domain Layer - Custom Error Classes
 * 비즈니스 로직 관련 커스텀 에러
 */

import { ERROR_CODES, ERROR_MESSAGES } from './constants';

/**
 * 애플리케이션 기본 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * 인증 에러
 */
export class AuthError extends AppError {
  constructor(code: string, message?: string) {
    super(code, message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || '인증 오류', 401);
    this.name = 'AuthError';
  }
}

/**
 * 권한 에러
 */
export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ERROR_CODES.AUTH_FORBIDDEN]) {
    super(ERROR_CODES.AUTH_FORBIDDEN, message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 리소스를 찾을 수 없음 에러
 */
export class NotFoundError extends AppError {
  constructor(resourceType: string, resourceId?: string) {
    const message = `${resourceType}${resourceId ? `(${resourceId})` : ''}을(를) 찾을 수 없습니다.`;
    super(ERROR_CODES.NOT_FOUND, message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 이미 존재함 에러
 */
export class AlreadyExistsError extends AppError {
  constructor(resourceType: string, details?: Record<string, any>) {
    const message = `${resourceType}이(가) 이미 존재합니다.`;
    super(ERROR_CODES.ALREADY_EXISTS, message, 409, details);
    this.name = 'AlreadyExistsError';
  }
}

/**
 * 입력 검증 에러
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(ERROR_CODES.INVALID_INPUT, message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * 비즈니스 로직 에러
 */
export class BusinessLogicError extends AppError {
  constructor(code: string, message: string, statusCode: number = 400) {
    super(code, message, statusCode);
    this.name = 'BusinessLogicError';
  }
}

/**
 * 데이터베이스 에러
 */
export class DatabaseError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ERROR_CODES.DATABASE_ERROR], originalError?: any) {
    super(ERROR_CODES.DATABASE_ERROR, message, 500, {
      originalMessage: originalError?.message,
    });
    this.name = 'DatabaseError';
  }
}

/**
 * 에러 생성 헬퍼 함수
 */
export function createError(code: string, message?: string, statusCode?: number): AppError {
  const errorMessage = message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || '알 수 없는 오류';

  switch (code) {
    case ERROR_CODES.AUTH_MISSING_TOKEN:
    case ERROR_CODES.AUTH_INVALID_TOKEN:
    case ERROR_CODES.AUTH_UNAUTHORIZED:
    case ERROR_CODES.AUTH_USER_NOT_FOUND:
      return new AuthError(code, errorMessage);

    case ERROR_CODES.AUTH_FORBIDDEN:
      return new ForbiddenError(errorMessage);

    case ERROR_CODES.NOT_FOUND:
      return new NotFoundError('리소스');

    case ERROR_CODES.ALREADY_EXISTS:
      return new AlreadyExistsError('리소스');

    case ERROR_CODES.INVALID_INPUT:
      return new ValidationError(errorMessage);

    case ERROR_CODES.DATABASE_ERROR:
      return new DatabaseError(errorMessage);

    default:
      return new AppError(code || ERROR_CODES.UNKNOWN_ERROR, errorMessage, statusCode || 500);
  }
}
