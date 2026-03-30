/**
 * Service Layer - Student Service
 * 학생 관리 비즈니스 로직
 */

import { db } from '../infrastructure/firebase';
import { Student, StudentStatus } from '../domain/types';
import { NotFoundError, DatabaseError, ValidationError, BusinessLogicError } from '../domain/errors';
import {
  validateSchoolId,
  validateClassId,
  validateStudentId,
  validateUserId,
  validateDisplayName,
  validateEmail,
  validateStudentNumber,
} from '../infrastructure/validators';
import { classService } from './ClassService';
import { ERROR_CODES } from '../domain/constants';
import { isMockMode, getMockStudents, getMockStudent, addMockStudent, updateMockStudent, deleteMockStudent } from '../infrastructure/mockData';

export class StudentService {
  /**
   * 학생 등록
   */
  async enrollStudent(
    schoolId: string,
    classId: string,
    userId: string,
    name: string,
    studentNumber: string,
    email: string
  ): Promise<Student> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateUserId(userId);
    validateDisplayName(name);
    validateStudentNumber(studentNumber);
    validateEmail(email);

    // Mock 모드
    if (isMockMode()) {
      // 중복 학생 확인
      const mockStudentList = getMockStudents(classId);
      if (mockStudentList.some((s) => s.userId === userId)) {
        throw new BusinessLogicError(
          ERROR_CODES.STUDENT_ALREADY_ENROLLED,
          '이미 등록된 학생입니다.'
        );
      }

      // 새 학생 ID 생성 (간단하게 timestamp 기반)
      const studentId = `student-${Date.now()}`;
      const now = new Date();

      const studentData: Student = {
        id: studentId,
        schoolId,
        classId,
        userId,
        name,
        studentNumber,
        email,
        status: 'active',
        enrolledAt: now,
        createdAt: now,
        updatedAt: now,
      };

      return addMockStudent(studentData);
    }

    try {
      // 반 정보 조회 및 정원 확인
      const classData = await classService.getClass(schoolId, classId);

      // 학생을 추가할 수 있는지 확인
      const canEnroll = await classService.canEnrollStudent(schoolId, classId);
      if (!canEnroll) {
        throw new BusinessLogicError(
          ERROR_CODES.CLASS_FULL,
          '반이 가득 찼습니다.'
        );
      }

      // 중복 학생 확인 (같은 반에 이미 등록된 학생)
      const existingStudent = await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!existingStudent.empty) {
        throw new BusinessLogicError(
          ERROR_CODES.STUDENT_ALREADY_ENROLLED,
          '이미 등록된 학생입니다.'
        );
      }

      const studentRef = db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .doc();
      const studentId = studentRef.id;

      const now = new Date();
      const studentData: Student = {
        id: studentId,
        schoolId,
        classId,
        userId,
        name,
        studentNumber,
        email,
        status: 'active',
        enrolledAt: now as any,
        createdAt: now as any,
        updatedAt: now as any,
      };

      await studentRef.set(studentData);

      return studentData;
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        throw error;
      }
      throw new DatabaseError('학생 등록 실패', error);
    }
  }

  /**
   * 학생 정보 조회
   */
  async getStudent(schoolId: string, classId: string, studentId: string): Promise<Student> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentId(studentId);

    // Mock 모드
    if (isMockMode()) {
      const student = getMockStudent(studentId);
      if (!student) {
        throw new NotFoundError('학생', studentId);
      }
      return student;
    }

    try {
      const studentDoc = await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .doc(studentId)
        .get();

      if (!studentDoc.exists) {
        throw new NotFoundError('학생', studentId);
      }

      return studentDoc.data() as Student;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학생 조회 실패', error);
    }
  }

  /**
   * 학생 정보 수정
   */
  async updateStudent(
    schoolId: string,
    classId: string,
    studentId: string,
    updates: Partial<{
      name: string;
      studentNumber: string;
      email: string;
    }>
  ): Promise<Student> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentId(studentId);

    if (updates.name) {
      validateDisplayName(updates.name);
    }
    if (updates.studentNumber) {
      validateStudentNumber(updates.studentNumber);
    }
    if (updates.email) {
      validateEmail(updates.email);
    }

    try {
      const studentData = await this.getStudent(schoolId, classId, studentId);

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .doc(studentId)
        .update(updateData);

      return { ...studentData, ...updateData } as Student;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학생 정보 수정 실패', error);
    }
  }

  /**
   * 학생을 반에서 제거
   */
  async removeStudent(schoolId: string, classId: string, studentId: string): Promise<void> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentId(studentId);

    try {
      await this.getStudent(schoolId, classId, studentId);

      await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .doc(studentId)
        .delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학생 제거 실패', error);
    }
  }

  /**
   * 학생 활성화 상태 변경
   */
  async deactivateStudent(schoolId: string, classId: string, studentId: string): Promise<Student> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentId(studentId);

    try {
      const studentData = await this.getStudent(schoolId, classId, studentId);

      const updateData = {
        status: 'inactive' as StudentStatus,
        updatedAt: new Date(),
      };

      await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .doc(studentId)
        .update(updateData);

      return { ...studentData, ...updateData } as Student;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('학생 비활성화 실패', error);
    }
  }

  /**
   * 반의 모든 학생 조회
   */
  async getClassStudents(schoolId: string, classId: string, includeInactive = false): Promise<Student[]> {
    validateSchoolId(schoolId);
    validateClassId(classId);

    // Mock 모드
    if (isMockMode()) {
      let students = getMockStudents(classId);
      if (!includeInactive) {
        students = students.filter((s) => s.status === 'active');
      }
      return students.sort((a, b) => a.name.localeCompare(b.name));
    }

    try {
      let query: FirebaseFirestore.Query = db.collection(`schools/${schoolId}/classes/${classId}/students`);

      if (!includeInactive) {
        query = query.where('status', '==', 'active');
      }

      const querySnapshot = await query.orderBy('name').get();

      return querySnapshot.docs.map((doc) => doc.data() as Student);
    } catch (error) {
      throw new DatabaseError('반 학생 목록 조회 실패', error);
    }
  }

  /**
   * 특정 사용자가 수강하는 모든 반 조회
   */
  async getStudentClasses(schoolId: string, userId: string): Promise<Array<{
    classId: string;
    className: string;
    gradeLevel: number;
    teacherName: string;
  }>> {
    validateSchoolId(schoolId);
    validateUserId(userId);

    try {
      // 모든 반을 순회하며 학생 검색
      const classesSnapshot = await db
        .collection(`schools/${schoolId}/classes`)
        .get();

      const studentClasses = [];

      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data();

        const studentSnapshot = await db
          .collection(`schools/${schoolId}/classes/${classDoc.id}/students`)
          .where('userId', '==', userId)
          .where('status', '==', 'active')
          .limit(1)
          .get();

        if (!studentSnapshot.empty) {
          // 교사 정보 조회
          const teacherDoc = await db.collection('users').doc(classData.teacherId).get();
          const teacherData = teacherDoc.data();

          studentClasses.push({
            classId: classDoc.id,
            className: classData.name,
            gradeLevel: classData.gradeLevel,
            teacherName: teacherData?.displayName || '미정',
          });
        }
      }

      return studentClasses;
    } catch (error) {
      throw new DatabaseError('학생 반 목록 조회 실패', error);
    }
  }

  /**
   * 학생 수 조회 (활성 상태만)
   */
  async getStudentCount(schoolId: string, classId: string): Promise<number> {
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
   * 학생 번호로 조회
   */
  async getStudentByNumber(schoolId: string, classId: string, studentNumber: string): Promise<Student | null> {
    validateSchoolId(schoolId);
    validateClassId(classId);
    validateStudentNumber(studentNumber);

    try {
      const querySnapshot = await db
        .collection(`schools/${schoolId}/classes/${classId}/students`)
        .where('studentNumber', '==', studentNumber)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as Student;
    } catch (error) {
      throw new DatabaseError('학생 조회 실패', error);
    }
  }
}

// Singleton 인스턴스
export const studentService = new StudentService();
