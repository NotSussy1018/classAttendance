/**
 * Controller Layer - School Controller
 * 학교 관리 HTTP 핸들러
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { authenticateRequest } from '../middleware/authenticate';
import { handleError, logError } from '../middleware/errorHandler';
import { createSuccessResponse } from '../infrastructure/responses';
import { requireAdmin } from '../middleware/authorize';
import { getCurrentUser, requireAccessToSchool } from '../infrastructure/auth';
import { schoolService } from '../services/SchoolService';

/**
 * 학교 생성 (관리자만)
 */
export async function createSchool(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);

    requireAdmin(currentUser);

    const { name, address, phoneNumber } = data;

    const school = await schoolService.createSchool(uid, name, address, phoneNumber);

    return createSuccessResponse(school);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학교 정보 조회
 */
export async function getSchool(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId } = data;

    // 같은 학교 사용자만 조회 가능
    await requireAccessToSchool(uid, schoolId);

    const school = await schoolService.getSchool(schoolId);

    return createSuccessResponse(school);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학교 정보 수정
 */
export async function updateSchool(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);
    const { schoolId, name, address, phoneNumber } = data;

    // 학교에 속하는지 확인
    await requireAccessToSchool(uid, schoolId);

    // 관리자만 수정 가능
    requireAdmin(currentUser);

    const school = await schoolService.updateSchool(schoolId, {
      name,
      address,
      phoneNumber,
    });

    return createSuccessResponse(school);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학교 삭제 (관리자만)
 */
export async function deleteSchool(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);
    const { schoolId } = data;

    requireAdmin(currentUser);

    await schoolService.deleteSchool(schoolId);

    return createSuccessResponse({ message: '학교가 삭제되었습니다.' });
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학교 내 모든 반 조회
 */
export async function getSchoolClasses(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId } = data;

    // 같은 학교 사용자만 조회 가능
    await requireAccessToSchool(uid, schoolId);

    const classes = await schoolService.getSchoolClasses(schoolId);

    return createSuccessResponse(classes);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학교 소속 모든 사용자 조회
 */
export async function getSchoolUsers(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, role } = data;

    // 같은 학교 사용자만 조회 가능
    await requireAccessToSchool(uid, schoolId);

    const users = await schoolService.getSchoolUsers(schoolId, role);

    return createSuccessResponse(users);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학교의 사용자 수 조회
 */
export async function getSchoolUserCount(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId } = data;

    // 같은 학교 사용자만 조회 가능
    await requireAccessToSchool(uid, schoolId);

    const count = await schoolService.getSchoolUserCount(schoolId);

    return createSuccessResponse(count);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}
