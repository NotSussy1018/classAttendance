/**
 * Middleware - Error Handler
 * 통일된 에러 처리
 */

import { AppError } from '../domain/errors';
import { ApiResponse } from '../domain/types';
import { ERROR_CODES, ERROR_MESSAGES } from '../domain/constants';

/**
 * 에러를 표준 응답 형식으로 변환
 */
export function handleError(error: any): {
  response: ApiResponse<null>;
  statusCode: number;
} {
  // AppError 인스턴스인 경우
  if (error instanceof AppError) {
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
        timestamp: Date.now(),
      },
      statusCode: error.statusCode,
    };
  }

  // Firebase 에러
  if (error.code && error.message) {
    const statusCode = getStatusCodeFromFirebaseError(error.code);
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
        timestamp: Date.now(),
      },
      statusCode,
    };
  }

  // 일반 에러
  console.error('Unhandled error:', error);
  return {
    response: {
      success: false,
      error: {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      },
      timestamp: Date.now(),
    },
    statusCode: 500,
  };
}

/**
 * Firebase 에러 코드를 HTTP 상태 코드로 변환
 */
function getStatusCodeFromFirebaseError(firebaseCode: string): number {
  const codeMap: Record<string, number> = {
    'auth/user-not-found': 404,
    'auth/invalid-password': 401,
    'auth/email-already-exists': 409,
    'auth/invalid-email': 400,
    'auth/operation-not-allowed': 403,
    'firestore/permission-denied': 403,
    'firestore/not-found': 404,
    'firestore/already-exists': 409,
    'firestore/invalid-argument': 400,
  };

  return codeMap[firebaseCode] || 500;
}

/**
 * 에러 로깅 (프로덕션용)
 */
export function logError(error: any, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    name: error.name,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    context,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };

  console.error('[ERROR]', JSON.stringify(errorInfo, null, 2));
}

/**
 * 에러 재스로우 헬퍼
 */
export function throwError(error: any): never {
  if (error instanceof AppError) {
    throw error;
  }

  // 에러를 로깅하고 일반적인 메시지로 변환
  logError(error);
  throw new AppError(ERROR_CODES.INTERNAL_ERROR, ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR]);
}
