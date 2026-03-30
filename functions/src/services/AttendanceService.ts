/**
 * Service Layer - Attendance Service
 * 출석 관리 비즈니스 로직
 */

import { db } from '../infrastructure/firebase';
import { Attendance, AttendanceStatus } from '../domain/types';
import { NotFoundError, DatabaseError, ValidationError } from '../domain/errors';
import {
  validateSchoolId,
  validateClassId,
  validateStudentId,
  validateDateFormat,
  validateAttendanceStatus,
  validateTimeSlotId,
  validateUserId,
  validateOptionalString,
} from '../infrastructure/validators';

export class AttendanceService {
  /**
   * 개별 출석 기록
   */
  async recordSingleAttendance(
    schoolId: string,
    classId: string,
    date: string,
    studentId: string,
    timeslotId: string,
    status: AttendanceStatus,
    recordedBy: string,
    notes?: string
  ): Promise<Attendance> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDateFormat(date);
    validateStudentId(studentId);
    validateTimeSlotId(timeslotId);
    validateAttendanceStatus(status);
    validateUserId(recordedBy);
    if (notes) {
      validateOptionalString(notes, '메모', 500);
    }

    try {
      const attendanceRef = db
        .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
        .doc(studentId);

      const now = new Date();
      const attendanceData: Attendance = {
        id: studentId,
        schoolId,
        classId,
        studentId,
        date,
        timeslotId,
        status,
        recordedBy,
        notes,
        recordedAt: now as any,
        updatedAt: now as any,
      };

      await attendanceRef.set(attendanceData);

      return attendanceData;
    } catch (error) {
      throw new DatabaseError('출석 기록 저장 실패', error);
    }
  }

  /**
   * 일괄 출석 기록
   */
  async recordAttendance(
    schoolId: string,
    classId: string,
    date: string,
    timeslotId: string,
    records: Array<{
      studentId: string;
      status: AttendanceStatus;
      notes?: string;
    }>,
    recordedBy: string
  ): Promise<Attendance[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDateFormat(date);
    validateTimeSlotId(timeslotId);
    validateUserId(recordedBy);

    if (!Array.isArray(records) || records.length === 0) {
      throw new ValidationError('출석 기록이 최소 1개 이상 필요합니다.');
    }

    try {
      const batch = db.batch();
      const attendanceList: Attendance[] = [];

      const now = new Date();

      for (const record of records) {
        validateStudentId(record.studentId);
        validateAttendanceStatus(record.status);
        if (record.notes) {
          validateOptionalString(record.notes, '메모', 500);
        }

        const attendanceRef = db
          .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
          .doc(record.studentId);

        const attendanceData: Attendance = {
          id: record.studentId,
          schoolId,
          classId,
          studentId: record.studentId,
          date,
          timeslotId,
          status: record.status,
          recordedBy,
          notes: record.notes,
          recordedAt: now as any,
          updatedAt: now as any,
        };

        batch.set(attendanceRef, attendanceData);
        attendanceList.push(attendanceData);
      }

      await batch.commit();

      return attendanceList;
    } catch (error) {
      throw new DatabaseError('일괄 출석 기록 저장 실패', error);
    }
  }

  /**
   * 특정 날짜의 출석 조회 (반 전체)
   */
  async getAttendanceByDate(
    schoolId: string,
    classId: string,
    date: string
  ): Promise<Attendance[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDateFormat(date);

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
        .get();

      return querySnapshot.docs.map((doc) => doc.data() as Attendance);
    } catch (error) {
      throw new DatabaseError('날짜별 출석 조회 실패', error);
    }
  }

  /**
   * 학생의 기간별 출석 조회
   */
  async getStudentAttendance(
    schoolId: string,
    classId: string,
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<Attendance[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentId(studentId);
    validateDateFormat(startDate);
    validateDateFormat(endDate);

    if (startDate > endDate) {
      throw new ValidationError('시작 날짜가 종료 날짜보다 클 수 없습니다.');
    }

    try {
      // 날짜 범위 내의 모든 출석 기록 조회
      const attendances: Attendance[] = [];

      const dateRange = this.getDateRange(startDate, endDate);

      for (const date of dateRange) {
        const docSnapshot = await db
          .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
          .doc(studentId)
          .get();

        if (docSnapshot.exists) {
          attendances.push(docSnapshot.data() as Attendance);
        }
      }

      return attendances.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      throw new DatabaseError('학생 출석 조회 실패', error);
    }
  }

  /**
   * 출석 상태 수정
   */
  async updateAttendanceStatus(
    schoolId: string,
    classId: string,
    date: string,
    studentId: string,
    newStatus: AttendanceStatus,
    notes?: string
  ): Promise<Attendance> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDateFormat(date);
    validateStudentId(studentId);
    validateAttendanceStatus(newStatus);
    if (notes) {
      validateOptionalString(notes, '메모', 500);
    }

    try {
      const attendanceRef = db
        .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
        .doc(studentId);

      const attendanceDoc = await attendanceRef.get();

      if (!attendanceDoc.exists) {
        throw new NotFoundError('출석 기록', `${date}/${studentId}`);
      }

      const attendanceData = attendanceDoc.data() as Attendance;

      const updateData = {
        status: newStatus,
        notes: notes ?? attendanceData.notes,
        updatedAt: new Date(),
      };

      await attendanceRef.update(updateData);

      return { ...attendanceData, ...updateData } as Attendance;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('출석 상태 수정 실패', error);
    }
  }

  /**
   * 출석 기록 삭제
   */
  async deleteAttendance(
    schoolId: string,
    classId: string,
    date: string,
    studentId: string
  ): Promise<void> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDateFormat(date);
    validateStudentId(studentId);

    try {
      const attendanceRef = db
        .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
        .doc(studentId);

      const attendanceDoc = await attendanceRef.get();

      if (!attendanceDoc.exists) {
        throw new NotFoundError('출석 기록', `${date}/${studentId}`);
      }

      await attendanceRef.delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('출석 기록 삭제 실패', error);
    }
  }

  /**
   * 날짜 범위 내의 모든 날짜 배열 생성
   */
  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * 특정 월의 출석 데이터 조회
   */
  async getMonthlyAttendance(
    schoolId: string,
    classId: string,
    studentId: string,
    yearMonth: string // YYYY-MM
  ): Promise<Attendance[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentId(studentId);

    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      throw new ValidationError('월 형식이 올바르지 않습니다. (YYYY-MM)');
    }

    const [year, month] = yearMonth.split('-');
    const startDate = `${year}-${month}-01`;

    // 해당 월의 마지막 날 계산
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    return this.getStudentAttendance(schoolId, classId, studentId, startDate, endDate);
  }

  /**
   * 특정 시간대의 반 전체 출석 현황 조회
   */
  async getClassAttendanceByTimeSlot(
    schoolId: string,
    classId: string,
    date: string,
    timeslotId: string
  ): Promise<Attendance[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDateFormat(date);
    validateTimeSlotId(timeslotId);

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes/${classId}/attendances/${date}`)
        .where('timeslotId', '==', timeslotId)
        .get();

      return querySnapshot.docs.map((doc) => doc.data() as Attendance);
    } catch (error) {
      throw new DatabaseError('시간대별 출석 조회 실패', error);
    }
  }
}

// Singleton 인스턴스
export const attendanceService = new AttendanceService();
