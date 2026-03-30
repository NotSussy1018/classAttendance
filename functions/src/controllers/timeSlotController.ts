/**
 * Controller Layer - TimeSlot Controller
 * 시간대 관리 HTTP 핸들러
 */

import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import { authenticateRequest } from '../middleware/authenticate';
import { handleError, logError } from '../middleware/errorHandler';
import { createSuccessResponse } from '../infrastructure/responses';
import { requireAccessToClass, requireAccessToSchool } from '../infrastructure/auth';
import { timeSlotService } from '../services/TimeSlotService';

/**
 * 시간대 생성
 */
export async function createTimeSlot(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, dayOfWeek, startTime, endTime, subject } = data;

    // 반에 대한 접근 권한 확인 (담당 교사만)
    await requireAccessToClass(uid, schoolId, classId);

    const timeSlot = await timeSlotService.createTimeSlot(
      schoolId,
      classId,
      dayOfWeek,
      startTime,
      endTime,
      subject
    );

    return createSuccessResponse(timeSlot);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 시간대 조회
 */
export async function getTimeSlot(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, slotId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const timeSlot = await timeSlotService.getTimeSlot(schoolId, classId, slotId);

    return createSuccessResponse(timeSlot);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 반의 모든 시간대 조회
 */
export async function getTimeSlots(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const timeSlots = await timeSlotService.getTimeSlots(schoolId, classId);

    return createSuccessResponse(timeSlots);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 특정 요일의 시간대 조회
 */
export async function getTimeSlotsByDay(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, dayOfWeek } = data;

    // 학교 접근 권한 확인
    await requireAccessToSchool(uid, schoolId);

    const timeSlots = await timeSlotService.getTimeSlotsByDay(schoolId, classId, dayOfWeek);

    return createSuccessResponse(timeSlots);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 시간대 수정
 */
export async function updateTimeSlot(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, slotId, dayOfWeek, startTime, endTime, subject } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    const updatedSlot = await timeSlotService.updateTimeSlot(schoolId, classId, slotId, {
      dayOfWeek,
      startTime,
      endTime,
      subject,
    });

    return createSuccessResponse(updatedSlot);
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}

/**
 * 시간대 삭제
 */
export async function deleteTimeSlot(data: any, context: CallableContext) {
  try {
    const uid = await authenticateRequest(context);
    const { schoolId, classId, slotId } = data;

    // 반에 대한 접근 권한 확인
    await requireAccessToClass(uid, schoolId, classId);

    await timeSlotService.deleteTimeSlot(schoolId, classId, slotId);

    return createSuccessResponse({ message: '시간대가 삭제되었습니다.' });
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    throw new Error(JSON.stringify({ statusCode, ...response }));
  }
}
