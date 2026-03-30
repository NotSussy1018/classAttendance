/**
 * Controller Layer - Attendance Controller
 * 출석 관리 HTTP 핸들러
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { authenticateRequest } from '../middleware/authenticate';
import { handleError, logError } from '../middleware/errorHandler';
import { createSuccessResponse } from '../infrastructure/responses';
import { requireAccessToClass, requireAccessToSchool, requireAccessToStudentAttendance } from '../infrastructure/auth';
import { attendanceService } from '../services/AttendanceService';

/**
 * 개별 출석 기록
 */
export async function recordSingleAttendance(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, date, studentId, timeslotId, status, notes } = data;

    // 반에 대한 접근 권한 확인 (담당 교사만)
    await requireAccessToClass(uid, schoolId, classId);

    const attendance = await attendanceService.recordSingleAttendance(
      schoolId,
      classId,
      date,
      studentId,
      timeslotId,
      status,
      uid,
      notes
    );

    return createSuccessResponse(attendance);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 일괄 출석 기록
 */
export async function recordAttendance(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, date, timeslotId, records } = data;

    // 반에 대한 접근 권한 확인 (담당 교사만)
    await requireAccessToClass(uid, schoolId, classId);

    const attendanceList = await attendanceService.recordAttendance(
      schoolId,
      classId,
      date,
      timeslotId,
      records,
      uid
    );

    return createSuccessResponse(attendanceList);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 특정 날짜의 출석 조회
 */
export async function getAttendanceByDate(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, date } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const attendances = await attendanceService.getAttendanceByDate(schoolId, classId, date);

    return createSuccessResponse(attendances);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 학생의 기간별 출석 조회
 */
export async function getStudentAttendance(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, studentId, startDate, endDate } = data;

    // 학생 출석 데이터 접근 권한 확인
    await requireAccessToStudentAttendance(uid, schoolId, classId, studentId);

    const attendances = await attendanceService.getStudentAttendance(
      schoolId,
      classId,
      studentId,
      startDate,
      endDate
    );

    return createSuccessResponse(attendances);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 출석 상태 수정
 */
export async function updateAttendanceStatus(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, date, studentId, status, notes } = data;

    // 반에 대한 접근 권한 확인 (담당 교사만)
    await requireAccessToClass(uid, schoolId, classId);

    const updatedAttendance = await attendanceService.updateAttendanceStatus(
      schoolId,
      classId,
      date,
      studentId,
      status,
      notes
    );

    return createSuccessResponse(updatedAttendance);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 출석 기록 삭제
 */
export async function deleteAttendance(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, date, studentId } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    await attendanceService.deleteAttendance(schoolId, classId, date, studentId);

    return createSuccessResponse({ message: '출석 기록이 삭제되었습니다.' });
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 월별 출석 조회
 */
export async function getMonthlyAttendance(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, studentId, yearMonth } = data;

    // 학생 출석 데이터 접근 권한 확인
    await requireAccessToStudentAttendance(uid, schoolId, classId, studentId);

    const attendances = await attendanceService.getMonthlyAttendance(
      schoolId,
      classId,
      studentId,
      yearMonth
    );

    return createSuccessResponse(attendances);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 특정 시간대의 반 전체 출석 조회
 */
export async function getClassAttendanceByTimeSlot(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, date, timeslotId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const attendances = await attendanceService.getClassAttendanceByTimeSlot(
      schoolId,
      classId,
      date,
      timeslotId
    );

    return createSuccessResponse(attendances);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}
