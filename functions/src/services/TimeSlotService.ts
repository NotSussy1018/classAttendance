/**
 * Service Layer - TimeSlot Service
 * 시간대 관리 비즈니스 로직
 */

import { db } from '../infrastructure/firebase';
import { TimeSlot } from '../domain/types';
import { NotFoundError, DatabaseError, ValidationError, BusinessLogicError } from '../domain/errors';
import {
  validateSchoolId,
  validateClassId,
  validateTimeSlotId,
  validateDayOfWeek,
  validateTimeFormat,
  validateSubject,
} from '../infrastructure/validators';
import { ERROR_CODES } from '../domain/constants';
import { isMockMode, getMockTimeSlots, getMockTimeSlot, addMockTimeSlot, updateMockTimeSlot, deleteMockTimeSlot } from '../infrastructure/mockData';

export class TimeSlotService {
  /**
   * 시간대 생성
   */
  async createTimeSlot(
    schoolId: string,
    classId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    subject: string
  ): Promise<TimeSlot> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDayOfWeek(dayOfWeek);
    validateTimeFormat(startTime);
    validateTimeFormat(endTime);
    validateSubject(subject);

    // 시간 순서 확인
    if (startTime >= endTime) {
      throw new ValidationError('시작 시간은 종료 시간보다 작아야 합니다.');
    }

    if (isMockMode()) {
      // 중복 시간대 확인 (같은 요일, 시간 겹침)
      const existingSlots = getMockTimeSlots(classId).filter((s) => s.dayOfWeek === dayOfWeek);

      for (const slot of existingSlots) {
        // 시간이 겹치는지 확인
        if (
          (startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime)
        ) {
          throw new BusinessLogicError(
            ERROR_CODES.DUPLICATE_TIMESLOT,
            '해당 시간대는 이미 예약되어 있습니다.'
          );
        }
      }

      const slotId = `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const slotData: TimeSlot = {
        id: slotId,
        schoolId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        subject,
        createdAt: now,
        updatedAt: now,
      };

      return addMockTimeSlot(slotData);
    }

    try {
      // 중복 시간대 확인 (같은 요일, 시간 겹침)
      const existingSlots = await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .where('dayOfWeek', '==', dayOfWeek)
        .get();

      for (const slot of existingSlots.docs) {
        const slotData = slot.data();
        // 시간이 겹치는지 확인
        if (
          (startTime >= slotData.startTime && startTime < slotData.endTime) ||
          (endTime > slotData.startTime && endTime <= slotData.endTime) ||
          (startTime <= slotData.startTime && endTime >= slotData.endTime)
        ) {
          throw new BusinessLogicError(
            ERROR_CODES.DUPLICATE_TIMESLOT,
            '해당 시간대는 이미 예약되어 있습니다.'
          );
        }
      }

      const slotRef = db.collection(`schools/${schoolId}/classes/${classId}/timeslots`).doc();
      const slotId = slotRef.id;

      const now = new Date();
      const slotData: TimeSlot = {
        id: slotId,
        schoolId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        subject,
        createdAt: now as any,
        updatedAt: now as any,
      };

      await slotRef.set(slotData);

      return slotData;
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        throw error;
      }
      throw new DatabaseError('시간대 생성 실패', error);
    }
  }

  /**
   * 시간대 조회
   */
  async getTimeSlot(schoolId: string, classId: string, slotId: string): Promise<TimeSlot> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateTimeSlotId(slotId);

    if (isMockMode()) {
      const slot = getMockTimeSlot(slotId);
      if (!slot) {
        throw new NotFoundError('시간대', slotId);
      }
      return slot;
    }

    try {
      const slotDoc = await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .doc(slotId)
        .get();

      if (!slotDoc.exists) {
        throw new NotFoundError('시간대', slotId);
      }

      return slotDoc.data() as TimeSlot;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('시간대 조회 실패', error);
    }
  }

  /**
   * 반의 모든 시간대 조회
   */
  async getTimeSlots(schoolId: string, classId: string): Promise<TimeSlot[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);

    if (isMockMode()) {
      const slots = getMockTimeSlots(classId);
      return slots.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
    }

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .orderBy('dayOfWeek')
        .orderBy('startTime')
        .get();

      return querySnapshot.docs.map((doc) => doc.data() as TimeSlot);
    } catch (error) {
      throw new DatabaseError('시간대 목록 조회 실패', error);
    }
  }

  /**
   * 특정 요일의 시간대 조회
   */
  async getTimeSlotsByDay(schoolId: string, classId: string, dayOfWeek: number): Promise<TimeSlot[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateDayOfWeek(dayOfWeek);

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .where('dayOfWeek', '==', dayOfWeek)
        .orderBy('startTime')
        .get();

      return querySnapshot.docs.map((doc) => doc.data() as TimeSlot);
    } catch (error) {
      throw new DatabaseError('시간대 목록 조회 실패', error);
    }
  }

  /**
   * 시간대 수정
   */
  async updateTimeSlot(
    schoolId: string,
    classId: string,
    slotId: string,
    updates: Partial<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      subject: string;
    }>
  ): Promise<TimeSlot> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateTimeSlotId(slotId);

    if (updates.dayOfWeek !== undefined) {
      validateDayOfWeek(updates.dayOfWeek);
    }
    if (updates.startTime) {
      validateTimeFormat(updates.startTime);
    }
    if (updates.endTime) {
      validateTimeFormat(updates.endTime);
    }
    if (updates.subject) {
      validateSubject(updates.subject);
    }

    try {
      const slotData = await this.getTimeSlot(schoolId, classId, slotId);

      // 수정되는 정보로 다시 중복 확인
      const dayOfWeek = updates.dayOfWeek ?? slotData.dayOfWeek;
      const startTime = updates.startTime ?? slotData.startTime;
      const endTime = updates.endTime ?? slotData.endTime;

      // 시간 순서 확인
      if (startTime >= endTime) {
        throw new ValidationError('시작 시간은 종료 시간보다 작아야 합니다.');
      }

      // 중복 시간대 확인 (자신 제외)
      const existingSlots = await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .where('dayOfWeek', '==', dayOfWeek)
        .get();

      for (const slot of existingSlots.docs) {
        if (slot.id === slotId) continue; // 자신 제외

        const existingSlotData = slot.data();
        if (
          (startTime >= existingSlotData.startTime && startTime < existingSlotData.endTime) ||
          (endTime > existingSlotData.startTime && endTime <= existingSlotData.endTime) ||
          (startTime <= existingSlotData.startTime && endTime >= existingSlotData.endTime)
        ) {
          throw new BusinessLogicError(
            ERROR_CODES.DUPLICATE_TIMESLOT,
            '해당 시간대는 이미 예약되어 있습니다.'
          );
        }
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .doc(slotId)
        .update(updateData);

      return { ...slotData, ...updateData } as TimeSlot;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BusinessLogicError) {
        throw error;
      }
      throw new DatabaseError('시간대 수정 실패', error);
    }
  }

  /**
   * 시간대 삭제
   */
  async deleteTimeSlot(schoolId: string, classId: string, slotId: string): Promise<void> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateTimeSlotId(slotId);

    if (isMockMode()) {
      await this.getTimeSlot(schoolId, classId, slotId);
      const deleted = deleteMockTimeSlot(slotId);
      if (!deleted) {
        throw new NotFoundError('시간대', slotId);
      }
      return;
    }

    try {
      await this.getTimeSlot(schoolId, classId, slotId);

      await db
        .collection(`schools/${schoolId}/classes/${classId}/timeslots`)
        .doc(slotId)
        .delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('시간대 삭제 실패', error);
    }
  }
}

// Singleton 인스턴스
export const timeSlotService = new TimeSlotService();
