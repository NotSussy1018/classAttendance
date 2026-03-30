/**
 * Service Layer - School Service
 * 학교 관리 비즈니스 로직
 */

import { db } from '../infrastructure/firebase';
import { School, User, UserRole } from '../domain/types';
import { NotFoundError, DatabaseError, ValidationError } from '../domain/errors';
import {
  validateSchoolId,
  validateSchoolName,
  validateAddress,
  validateOptionalString,
} from '../infrastructure/validators';
import { USER_ROLES } from '../domain/constants';
import { userService } from './UserService';

export class SchoolService {
  /**
   * 학교 생성
   */
  async createSchool(
    adminId: string,
    name: string,
    address: string,
    phoneNumber?: string
  ): Promise<School> {
    validateSchoolName(name);
    validateAddress(address);
    if (phoneNumber) {
      validateOptionalString(phoneNumber, '전화번호', 20);
    }

    try {
      // 새 학교 ID 자동 생성
      const schoolRef = db.collection('schools').doc();
      const schoolId = schoolRef.id;

      const now = new Date();
      const schoolData: School = {
        id: schoolId,
        name,
        address,
        adminId,
        phoneNumber,
        createdAt: now as any,
        updatedAt: now as any,
      };

      await schoolRef.set(schoolData);

      return schoolData;
    } catch (error) {
      throw new DatabaseError('학교 생성 실패', error);
    }
  }

  /**
   * 학교 정보 조회
   */
  async getSchool(schoolId: string): Promise<School> {
    validateSchoolId(schoolId);

    try {
      const schoolDoc = await db.collection('schools').doc(schoolId).get();

      if (!schoolDoc.exists) {
        throw new NotFoundError('학교', schoolId);
      }

      return schoolDoc.data() as School;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학교 조회 실패', error);
    }
  }

  /**
   * 학교 정보 수정
   */
  async updateSchool(
    schoolId: string,
    updates: Partial<{
      name: string;
      address: string;
      phoneNumber?: string;
    }>
  ): Promise<School> {
    validateSchoolId(schoolId);

    if (updates.name) {
      validateSchoolName(updates.name);
    }
    if (updates.address) {
      validateAddress(updates.address);
    }
    if (updates.phoneNumber) {
      validateOptionalString(updates.phoneNumber, '전화번호', 20);
    }

    try {
      const school = await this.getSchool(schoolId);

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.collection('schools').doc(schoolId).update(updateData);

      return { ...school, ...updateData } as School;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학교 수정 실패', error);
    }
  }

  /**
   * 학교 삭제
   */
  async deleteSchool(schoolId: string): Promise<void> {
    validateSchoolId(schoolId);

    try {
      // 학교 문서 삭제
      await db.collection('schools').doc(schoolId).delete();
    } catch (error) {
      throw new DatabaseError('학교 삭제 실패', error);
    }
  }

  /**
   * 학교 소속 모든 사용자 조회
   */
  async getSchoolUsers(schoolId: string, role?: string): Promise<User[]> {
    validateSchoolId(schoolId);

    try {
      // 학교 존재 확인
      await this.getSchool(schoolId);

      // 역할 검증
      let validatedRole: UserRole | undefined;
      if (role) {
        if (!Object.values(USER_ROLES).includes(role as UserRole)) {
          throw new ValidationError('유효하지 않은 사용자 역할입니다.', { role });
        }
        validatedRole = role as UserRole;
      }

      // UserService를 통해 사용자 조회
      return await userService.getUsersBySchool(schoolId, validatedRole);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('학교 사용자 조회 실패', error);
    }
  }

  /**
   * 학교 내 모든 반 조회
   */
  async getSchoolClasses(schoolId: string): Promise<
    Array<{
      id: string;
      name: string;
      teacherId: string;
      teacherName: string;
      gradeLevel: number;
      studentCount: number;
    }>
  > {
    validateSchoolId(schoolId);

    try {
      // 학교 존재 확인
      await this.getSchool(schoolId);

      // 반 목록 조회
      const classesSnapshot = await db
        .collection(`schools/${schoolId}/classes`)
        .orderBy('gradeLevel')
        .orderBy('name')
        .get();

      const classes = [];

      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data() as any;

        // 담당 교사 정보 조회
        const teacher = await userService.getUser(classData.teacherId);

        // 학생 수 조회
        const studentsSnapshot = await db
          .collection(`schools/${schoolId}/classes/${classDoc.id}/students`)
          .where('status', '==', 'active')
          .count()
          .get();

        classes.push({
          id: classDoc.id,
          name: classData.name,
          teacherId: classData.teacherId,
          teacherName: teacher.displayName,
          gradeLevel: classData.gradeLevel,
          studentCount: studentsSnapshot.data().count,
        });
      }

      return classes;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학교 반 목록 조회 실패', error);
    }
  }

  /**
   * 학교의 사용자 수 조회
   */
  async getSchoolUserCount(schoolId: string): Promise<{
    total: number;
    teachers: number;
    students: number;
    admins: number;
  }> {
    validateSchoolId(schoolId);

    try {
      const [totalCount, teacherCount, studentCount, adminCount] = await Promise.all([
        db.collection('users').where('schoolId', '==', schoolId).count().get(),
        userService.getUserCountByRole(schoolId, 'teacher'),
        userService.getUserCountByRole(schoolId, 'student'),
        userService.getUserCountByRole(schoolId, 'admin'),
      ]);

      return {
        total: totalCount.data().count,
        teachers: teacherCount,
        students: studentCount,
        admins: adminCount,
      };
    } catch (error) {
      throw new DatabaseError('사용자 수 조회 실패', error);
    }
  }
}

// Singleton 인스턴스
export const schoolService = new SchoolService();
