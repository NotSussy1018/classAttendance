/**
 * Controller Layer - User Controller
 * 사용자 관리 HTTP 핸들러
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { authenticateRequest } from '../middleware/authenticate';
import { handleError, logError } from '../middleware/errorHandler';
import { createSuccessResponse } from '../infrastructure/responses';
import { requireAdmin, authorize } from '../middleware/authorize';
import { userService } from '../services/UserService';
import { getCurrentUser, requireAccessToSchool } from '../infrastructure/auth';

/**
 * 사용자 생성 (회원가입)
 */
export async function createUser(data: any, context: CallableContext) {
  try {
    // 이미 인증된 사용자면 조기 반환
    if (context.auth?.uid) {
      return handleError(new Error('Already authenticated user'));
    }

    const { email, password, displayName, schoolId, role } = data;

    const user = await userService.createUser(email, password, displayName, schoolId, role);

    return createSuccessResponse(user);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 사용자 정보 조회
 */
export async function getUser(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { userId } = data;

    // 자신의 정보나 관리자만 조회 가능
    if (uid !== userId) {
      const currentUser = await getCurrentUser(uid);
      requireAdmin(currentUser);
    }

    const user = await userService.getUser(userId);

    return createSuccessResponse(user);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 사용자 프로필 수정
 */
export async function updateUserProfile(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { displayName, photoURL } = data;

    const updatedUser = await userService.updateUserProfile(uid, {
      displayName,
      photoURL,
    });

    return createSuccessResponse(updatedUser);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);
    const { email } = data;

    // 자신의 학교 내에서만 조회 가능
    await requireAccessToSchool(uid, currentUser.schoolId);

    const user = await userService.getUserByEmail(email);

    // 같은 학교의 사용자만 반환
    if (user.schoolId !== currentUser.schoolId && currentUser.role !== 'admin') {
      throw new Error('Access denied');
    }

    return createSuccessResponse(user);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 사용자 역할 설정 (관리자만)
 */
export async function setUserRole(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);

    // 관리자 권한 확인
    requireAdmin(currentUser);

    const { userId, role } = data;

    await userService.setUserRole(userId, role);

    const updatedUser = await userService.getUser(userId);

    return createSuccessResponse(updatedUser);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

