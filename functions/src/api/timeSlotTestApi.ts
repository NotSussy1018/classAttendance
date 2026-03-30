/**
 * Time Slot API Test Endpoint
 * 브라우저에서 직접 호출 가능한 REST API
 * http://localhost:3000/api/timeslot?action=...&params=...
 */

import { Request, Response } from 'express';
import { timeSlotService } from '../services/TimeSlotService';
import { handleError, logError } from '../middleware/errorHandler';

/**
 * 시간대 API 테스트 엔드포인트
 * Query/Body parameters:
 * - action: 'getTimeSlots', 'getTimeSlot', 'createTimeSlot', 'updateTimeSlot', 'deleteTimeSlot'
 * - schoolId: 학교 ID
 * - classId: 반 ID
 * - slotId: 시간대 ID (getTimeSlot, updateTimeSlot, deleteTimeSlot 필요)
 * - dayOfWeek: 요일 (0-6, createTimeSlot, updateTimeSlot 필요)
 * - startTime: 시작 시간 (HH:mm, createTimeSlot, updateTimeSlot 필요)
 * - endTime: 종료 시간 (HH:mm, createTimeSlot, updateTimeSlot 필요)
 * - subject: 과목명 (createTimeSlot, updateTimeSlot 필요)
 */
export async function timeSlotApi(req: Request, res: Response): Promise<void> {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    const action = req.method === 'POST' ? req.body.action : (req.query.action as string);
    const schoolId = req.method === 'POST' ? req.body.schoolId : (req.query.schoolId as string) || 'school-001';
    const classId = req.method === 'POST' ? req.body.classId : (req.query.classId as string) || 'class-001';

    if (!action) {
      res.status(400).json({
        success: false,
        error: 'action 파라미터가 필요합니다.',
        availableActions: [
          'getTimeSlots',
          'getTimeSlot',
          'createTimeSlot',
          'updateTimeSlot',
          'deleteTimeSlot',
        ],
      });
      return;
    }

    let result;

    switch (action) {
      case 'getTimeSlots': {
        result = await timeSlotService.getTimeSlots(schoolId, classId);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'getTimeSlot': {
        const slotId = req.method === 'POST' ? req.body.slotId : (req.query.slotId as string);
        if (!slotId) {
          res.status(400).json({
            success: false,
            error: 'slotId 파라미터가 필요합니다.',
          });
          return;
        }
        result = await timeSlotService.getTimeSlot(schoolId, classId, slotId);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'createTimeSlot': {
        const dayOfWeek = req.method === 'POST' ? req.body.dayOfWeek : (req.query.dayOfWeek as string);
        const startTime = req.method === 'POST' ? req.body.startTime : (req.query.startTime as string);
        const endTime = req.method === 'POST' ? req.body.endTime : (req.query.endTime as string);
        const subject = req.method === 'POST' ? req.body.subject : (req.query.subject as string);

        if (dayOfWeek === undefined || !startTime || !endTime || !subject) {
          res.status(400).json({
            success: false,
            error: 'dayOfWeek, startTime, endTime, subject 파라미터가 모두 필요합니다.',
          });
          return;
        }

        result = await timeSlotService.createTimeSlot(
          schoolId,
          classId,
          parseInt(dayOfWeek as string),
          startTime,
          endTime,
          subject
        );
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'updateTimeSlot': {
        const slotId = req.method === 'POST' ? req.body.slotId : (req.query.slotId as string);
        if (!slotId) {
          res.status(400).json({
            success: false,
            error: 'slotId 파라미터가 필요합니다.',
          });
          return;
        }

        const updates: any = {};
        const dayOfWeek = req.method === 'POST' ? req.body.dayOfWeek : (req.query.dayOfWeek as string);
        const startTime = req.method === 'POST' ? req.body.startTime : (req.query.startTime as string);
        const endTime = req.method === 'POST' ? req.body.endTime : (req.query.endTime as string);
        const subject = req.method === 'POST' ? req.body.subject : (req.query.subject as string);

        if (dayOfWeek !== undefined) updates.dayOfWeek = parseInt(dayOfWeek as string);
        if (startTime) updates.startTime = startTime;
        if (endTime) updates.endTime = endTime;
        if (subject) updates.subject = subject;

        result = await timeSlotService.updateTimeSlot(schoolId, classId, slotId, updates);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'deleteTimeSlot': {
        const slotId = req.method === 'POST' ? req.body.slotId : (req.query.slotId as string);
        if (!slotId) {
          res.status(400).json({
            success: false,
            error: 'slotId 파라미터가 필요합니다.',
          });
          return;
        }

        await timeSlotService.deleteTimeSlot(schoolId, classId, slotId);
        res.status(200).json({
          success: true,
          action,
          data: null,
        });
        return;
      }

      default:
        res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'getTimeSlots',
            'getTimeSlot',
            'createTimeSlot',
            'updateTimeSlot',
            'deleteTimeSlot',
          ],
        });
    }
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    res.status(statusCode).json({
      ...response,
    });
  }
}
