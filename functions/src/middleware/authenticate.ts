/**
 * Middleware - Authentication
 * 인증 미들웨어
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { verifyToken } from '../infrastructure/auth';
import { AppError } from '../domain/errors';
import { createErrorResponse } from '../infrastructure/responses';

/**
 * Cloud Functions onCall 요청에서 인증 검증
 * Firebase Admin SDK가 자동으로 context.auth를 설정함
 */
export async function authenticateRequest(context: CallableContext): Promise<string> {
  try {
    // Firebase onCall은 자동으로 context.auth를 설정함
    const uid = context.auth?.uid;

    if (!uid) {
      throw new AppError('AUTH_MISSING_TOKEN', 'User is not authenticated', 401);
    }

    return uid;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('AUTH_INVALID_TOKEN', 'Authentication failed: ' + (error as any).message, 401);
  }
}

/**
 * HTTP 요청에서 Bearer 토큰 추출 및 검증
 */
export async function authenticateHttpRequest(
  authHeader?: string
): Promise<string> {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    const uid = await verifyToken(token);

    return uid;
  } catch (error) {
    throw new AppError('AUTH_FAILED', 'Authentication failed: ' + (error as any).message, 401);
  }
}

/**
 * 에러 처리: 인증 실패 응답
 */
export function handleAuthError(error: any) {
  if (error instanceof AppError) {
    return createErrorResponse(error.code, error.message, error.statusCode);
  }

  return createErrorResponse('AUTH_ERROR', 'Authentication error', 401);
}
