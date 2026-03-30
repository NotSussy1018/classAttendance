/**
 * Service Layer - Class Service
 * 반 관리 비즈니스 로직
 */

import { db } from '../infrastructure/firebase';
import { Class } from '../domain/types';
import { NotFoundError, DatabaseError, ValidationError, BusinessLogicError } from '../domain/errors';
import {
  validateSchoolId,
  validateClassId,
  validateClassName,
  validateGradeLevel,
  validateMaxStudents,
  validateUserId,
  validateOptionalString,
} from '../infrastructure/validators';
import { ERROR_CODES } from '../domain/constants';
import { isMockMode, getMockClasses, getMockClass, addMockClass, updateMockClass, deleteMockClass } from '../infrastructure/mockData';

export class ClassService {
  /**
   * 반 생성
   */
  async createClass(
    schoolId: string,
    teacherId: string,
    name: string,
    gradeLevel: number,
    maxStudents: number,
    description?: string
  ): Promise<Class> {
    validateSchoolId(schoolId);
    validateUserId(teacherId);
    validateClassName(name);
    validateGradeLevel(gradeLevel);
    validateMaxStudents(maxStudents);
    if (description) {
      validateOptionalString(description, '설명', 200);
    }

    if (isMockMode()) {
      const classId = `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const classData: Class = {
        id: classId,
        schoolId,
        name,
        teacherId,
        gradeLevel,
        maxStudents,
        description,
        createdAt: now,
        updatedAt: now,
      };
      return addMockClass(classData);
    }

    try {
      const classRef = db.collection(`schools/${schoolId}/classes`).doc();
      const classId = classRef.id;

      const now = new Date();
      const classData: Class = {
        id: classId,
        schoolId,
        name,
        teacherId,
        gradeLevel,
        maxStudents,
        description,
        createdAt: now as any,
        updatedAt: now as any,
      };

      await classRef.set(classData);

      return classData;
    } catch (error) {
      throw new DatabaseError('반 생성 실패', error);
    }
  }

  /**
   * 반 정보 조회
   */
  async getClass(schoolId: string, classId: string): Promise<Class> {
    validateSchoolId(schoolId);
    validateClassId(classId);

    if (isMockMode()) {
      const mockClass = getMockClass(classId);
      if (!mockClass) {
        throw new NotFoundError('반', classId);
      }
      return mockClass;
    }

    try {
      const classDoc = await db.collection(`schools/${schoolId}/classes`).doc(classId).get();

      if (!classDoc.exists) {
        throw new NotFoundError('반', classId);
      }

      return classDoc.data() as Class;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('반 조회 실패', error);
    }
  }

  /**
   * 반 정보 수정
   */
  async updateClass(
    schoolId: string,
    classId: string,
    updates: Partial<{
      name: string;
      gradeLevel: number;
      maxStudents: number;
      description?: string;
    }>
  ): Promise<Class> {
    validateSchoolId(schoolId);
    validateClassId(classId);

    if (updates.name) {
      validateClassName(updates.name);
    }
    if (updates.gradeLevel) {
      validateGradeLevel(updates.gradeLevel);
    }
    if (updates.maxStudents) {
      validateMaxStudents(updates.maxStudents);
    }
    if (updates.description) {
      validateOptionalString(updates.description, '설명', 200);
    }

    if (isMockMode()) {
      const classData = await this.getClass(schoolId, classId);
      const updated = updateMockClass(classId, updates);
      if (!updated) {
        throw new NotFoundError('반', classId);
      }
      return updated;
    }

    try {
      const classData = await this.getClass(schoolId, classId);

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.collection(`schools/${schoolId}/classes`).doc(classId).update(updateData);

      return { ...classData, ...updateData } as Class;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('반 수정 실패', error);
    }
  }

  /**
   * 반 삭제
   */
  async deleteClass(schoolId: string, classId: string): Promise<void> {
    validateSchoolId(schoolId);
    validateClassId(classId);

    if (isMockMode()) {
      await this.getClass(schoolId, classId);
      const deleted = deleteMockClass(classId);
      if (!deleted) {
        throw new NotFoundError('반', classId);
      }
      return;
    }

    try {
      // 반이 존재하는지 확인
      await this.getClass(schoolId, classId);

      // 반 문서 삭제
      await db.collection(`schools/${schoolId}/classes`).doc(classId).delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('반 삭제 실패', error);
    }
  }

  /**
   * 교사가 담당하는 반 목록 조회
   */
  async getTeacherClasses(schoolId: string, teacherId: string): Promise<Class[]> {
    validateSchoolId(schoolId);
    validateUserId(teacherId);

    if (isMockMode()) {
      const classes = getMockClasses(schoolId).filter((c) => c.teacherId === teacherId);
      return classes.sort((a, b) => a.gradeLevel - b.gradeLevel || a.name.localeCompare(b.name));
    }

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes`)
        .where('teacherId', '==', teacherId)
        .orderBy('gradeLevel')
        .orderBy('name')
        .get();

      return querySnapshot.docs.map((doc) => doc.data() as Class);
    } catch (error) {
      throw new DatabaseError('교사 반 목록 조회 실패', error);
    }
  }

  /**
   * 담당 교사 변경
   */
  async transferClassTeacher(
    schoolId: string,
    classId: string,
    newTeacherId: string
  ): Promise<Class> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateUserId(newTeacherId);

    try {
      const classData = await this.getClass(schoolId, classId);

      const updateData = {
        teacherId: newTeacherId,
        updatedAt: new Date(),
      };

      await db.collection(`schools/${schoolId}/classes`).doc(classId).update(updateData);

      return { ...classData, ...updateData } as Class;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('담당 교사 변경 실패', error);
    }
  }

  /**
   * 반의 학생 수 조회
   */
  async getClassStudentCount(schoolId: string, classId: string): Promise<number> {
    validateSchoolId(schoolId);
    validateClassId(classId);

    try {
      const countSnapshot = await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .where('status', '==', 'active')
        .count()
        .get();

      return countSnapshot.data().count;
    } catch (error) {
      throw new DatabaseError('학생 수 조회 실패', error);
    }
  }

  /**
   * 반에 학생을 추가할 수 있는지 확인 (정원 체크)
   */
  async canEnrollStudent(schoolId: string, classId: string): Promise<boolean> {
    try {
      const classData = await this.getClass(schoolId, classId);
      const studentCount = await this.getClassStudentCount(schoolId, classId);

      return studentCount < classData.maxStudents;
    } catch (error) {
      throw new DatabaseError('학생 등록 가능 여부 확인 실패', error);
    }
  }

  /**
   * 반 이름 중복 확인
   */
  async isClassNameExists(schoolId: string, name: string): Promise<boolean> {
    validateSchoolId(schoolId);
    validateClassName(name);

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes`)
        .where('name', '==', name)
        .limit(1)
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      throw new DatabaseError('반 이름 중복 확인 실패', error);
    }
  }
}

// Singleton 인스턴스
export const classService = new ClassService();
