/**
 * Infrastructure Layer - Standard Response Formats
 * API 응답 포맷 통일
 */

import { ApiResponse } from '../domain/types';

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(data?: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500
): {
  response: ApiResponse<null>;
  statusCode: number;
} {
  return {
    response: {
      success: false,
      error: {
        code,
        message,
      },
      timestamp: Date.now(),
    },
    statusCode,
  };
}

/**
 * 페이징된 응답 생성
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}> {
  const totalPages = Math.ceil(total / pageSize);

  return {
    success: true,
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    },
    timestamp: Date.now(),
  };
}

/**
 * 요청 검증 에러 응답
 */
export function createValidationErrorResponse(details: Record<string, any>) {
  return createErrorResponse('VALIDATION_ERROR', '입력값 검증 실패', 400);
}
