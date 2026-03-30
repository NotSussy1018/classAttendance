/**
 * Student API Test Endpoint
 * 브라우저에서 직접 호출 가능한 REST API
 * http://localhost:5001/.../studentApi?action=...&params=...
 */

import { Request, Response } from 'express';
import { studentService } from '../services/StudentService';
import { handleError, logError } from '../middleware/errorHandler';

/**
 * 학생 API 테스트 엔드포인트
 * Query parameters:
 * - action: 'getClassStudents', 'getStudent', 'enrollStudent'
 * - schoolId: 학교 ID
 * - classId: 반 ID
 * - studentId: 학생 ID (getStudent 필요)
 * - userId: 사용자 ID (enrollStudent 필요)
 * - name: 학생 이름 (enrollStudent 필요)
 * - studentNumber: 학번 (enrollStudent 필요)
 * - email: 이메일 (enrollStudent 필요)
 */
export async function studentApi(req: Request, res: Response): Promise<void> {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    const action = req.query.action as string;
    const schoolId = req.query.schoolId as string || 'school-001';
    const classId = req.query.classId as string || 'class-001';

    if (!action) {
      res.status(400).json({
        success: false,
        error: 'action 파라미터가 필요합니다.',
        availableActions: [
          'getClassStudents',
          'getStudent',
          'enrollStudent',
          'updateStudent',
          'removeStudent',
          'deactivateStudent',
          'getStudentClasses',
        ],
      });
      return;
    }

    let result;

    switch (action) {
      case 'getClassStudents': {
        const includeInactive = req.query.includeInactive === 'true';
        result = await studentService.getClassStudents(schoolId, classId, includeInactive);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'getStudent': {
        const studentId = req.query.studentId as string;
        if (!studentId) {
          res.status(400).json({
            success: false,
            error: 'studentId 파라미터가 필요합니다.',
          });
          return;
        }
        result = await studentService.getStudent(schoolId, classId, studentId);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'enrollStudent': {
        const userId = req.query.userId as string;
        const name = req.query.name as string;
        const studentNumber = req.query.studentNumber as string;
        const email = req.query.email as string;

        if (!userId || !name || !studentNumber || !email) {
          res.status(400).json({
            success: false,
            error: 'userId, name, studentNumber, email 파라미터가 모두 필요합니다.',
          });
          return;
        }

        result = await studentService.enrollStudent(schoolId, classId, userId, name, studentNumber, email);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'updateStudent': {
        const studentId = req.query.studentId as string;
        const name = req.query.name as string;
        const studentNumber = req.query.studentNumber as string;
        const email = req.query.email as string;

        if (!studentId) {
          res.status(400).json({
            success: false,
            error: 'studentId 파라미터가 필요합니다.',
          });
          return;
        }

        result = await studentService.updateStudent(schoolId, classId, studentId, {
          ...(name && { name }),
          ...(studentNumber && { studentNumber }),
          ...(email && { email }),
        });
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'removeStudent': {
        const studentId = req.query.studentId as string;
        if (!studentId) {
          res.status(400).json({
            success: false,
            error: 'studentId 파라미터가 필요합니다.',
          });
          return;
        }

        await studentService.removeStudent(schoolId, classId, studentId);
        res.status(200).json({
          success: true,
          action,
          message: '학생이 삭제되었습니다.',
        });
        return;
      }

      case 'deactivateStudent': {
        const studentId = req.query.studentId as string;
        if (!studentId) {
          res.status(400).json({
            success: false,
            error: 'studentId 파라미터가 필요합니다.',
          });
          return;
        }

        result = await studentService.deactivateStudent(schoolId, classId, studentId);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      case 'getStudentClasses': {
        const studentId = req.query.studentId as string;
        if (!studentId) {
          res.status(400).json({
            success: false,
            error: 'studentId 파라미터가 필요합니다.',
          });
          return;
        }

        result = await studentService.getStudentClasses(schoolId, studentId);
        res.status(200).json({
          success: true,
          action,
          data: result,
        });
        return;
      }

      default:
        res.status(400).json({
          success: false,
          error: `알 수 없는 action: ${action}`,
          availableActions: [
            'getClassStudents',
            'getStudent',
            'enrollStudent',
            'updateStudent',
            'removeStudent',
            'deactivateStudent',
            'getStudentClasses',
          ],
        });
        return;
    }
  } catch (error) {
    logError(error);
    const { response, statusCode } = handleError(error);
    res.status(statusCode).json({
      ...response,
    });
  }
}
