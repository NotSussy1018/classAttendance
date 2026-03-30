/**
 * Controller Layer - Class Controller
 * 반 관리 HTTP 핸들러
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { authenticateRequest } from '../middleware/authenticate';
import { handleError, logError } from '../middleware/errorHandler';
import { createSuccessResponse } from '../infrastructure/responses';
import { requireTeacherOrAdmin } from '../middleware/authorize';
import { getCurrentUser, requireAccessToClass, requireAccessToSchool, verifyTeacherOwnsClass } from '../infrastructure/auth';
import { classService } from '../services/ClassService';
import { ForbiddenError } from '../domain/errors';

/**
 * 반 생성 (교사)
 */
export async function createClass(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);
    const { schoolId, name, gradeLevel, maxStudents, description } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    // 교사 이상만 생성 가능
    requireTeacherOrAdmin(currentUser);

    const classData = await classService.createClass(
      schoolId,
      uid,
      name,
      gradeLevel,
      maxStudents,
      description
    );

    return createSuccessResponse(classData);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 반 정보 조회
 */
export async function getClass(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const classData = await classService.getClass(schoolId, classId);

    return createSuccessResponse(classData);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 반 정보 수정
 */
export async function updateClass(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, name, gradeLevel, maxStudents, description } = data;

    // 반에 대한 접근 권한 확인 (담당 교사만)
    await requireAccessToClass(uid, schoolId, classId);

    const updatedClass = await classService.updateClass(schoolId, classId, {
      name,
      gradeLevel,
      maxStudents,
      description,
    });

    return createSuccessResponse(updatedClass);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 반 삭제
 */
export async function deleteClass(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    await classService.deleteClass(schoolId, classId);

    return createSuccessResponse({ message: '반이 삭제되었습니다.' });
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 교사가 담당하는 반 목록 조회
 */
export async function getTeacherClasses(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);
    const { schoolId, teacherId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    // 자신 또는 관리자만 조회 가능
    if (uid !== teacherId && currentUser.role !== 'admin') {
      throw new ForbiddenError('이 정보를 조회할 권한이 없습니다.');
    }

    const classes = await classService.getTeacherClasses(schoolId, teacherId);

    return createSuccessResponse(classes);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 담당 교사 변경
 */
export async function transferClassTeacher(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const currentUser = await getCurrentUser(uid);
    const { schoolId, classId, newTeacherId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    // 관리자만 변경 가능
    requireTeacherOrAdmin(currentUser);

    const updatedClass = await classService.transferClassTeacher(
      schoolId,
      classId,
      newTeacherId
    );

    return createSuccessResponse(updatedClass);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}
