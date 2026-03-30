/**
 * Controller Layer - Student Controller
 * 학생 관리 HTTP 핸들러
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { authenticateRequest } from '../middleware/authenticate';
import { handleError, logError } from '../middleware/errorHandler';
import { createSuccessResponse } from '../infrastructure/responses';
import { requireAccessToClass, requireAccessToSchool } from '../infrastructure/auth';
import { studentService } from '../services/StudentService';

/**
 * 학생 등록
 */
export async function enrollStudent(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, userId, name, studentNumber, email } = data;

    // 반에 대한 접근 권한 확인 (담당 교사만)
    await requireAccessToClass(uid, schoolId, classId);

    const student = await studentService.enrollStudent(
      schoolId,
      classId,
      userId,
      name,
      studentNumber,
      email
    );

    return createSuccessResponse(student);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학생 정보 조회
 */
export async function getStudent(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, studentId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const student = await studentService.getStudent(schoolId, classId, studentId);

    return createSuccessResponse(student);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학생 정보 수정
 */
export async function updateStudent(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, studentId, name, studentNumber, email } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    const updatedStudent = await studentService.updateStudent(schoolId, classId, studentId, {
      name,
      studentNumber,
      email,
    });

    return createSuccessResponse(updatedStudent);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학생을 반에서 제거
 */
export async function removeStudent(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, studentId } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    await studentService.removeStudent(schoolId, classId, studentId);

    return createSuccessResponse({ message: '학생이 제거되었습니다.' });
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학생 비활성화
 */
export async function deactivateStudent(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, studentId } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    const deactivatedStudent = await studentService.deactivateStudent(schoolId, classId, studentId);

    return createSuccessResponse(deactivatedStudent);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 반의 모든 학생 조회
 */
export async function getClassStudents(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, includeInactive } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const students = await studentService.getClassStudents(schoolId, classId, includeInactive);

    return createSuccessResponse(students);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 특정 사용자가 수강하는 모든 반 조회
 */
export async function getStudentClasses(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const classes = await studentService.getStudentClasses(schoolId, uid);

    return createSuccessResponse(classes);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}
