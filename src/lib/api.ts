/**
 * API 클라이언트
 * 로컬 서버와 통신
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Student, TimeSlot, ApiResponse } from '../types/index';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * API 응답 에러 처리
 */
const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.error?.message) {
      return axiosError.response.data.error.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
};

export class StudentAPI {
  /**
   * 반의 모든 학생 조회
   */
  static async getClassStudents(schoolId: string, classId: string): Promise<Student[]> {
    try {
      if (!schoolId || !classId) {
        throw new Error('schoolId와 classId는 필수입니다.');
      }

      const response = await apiClient.get('/student', {
        params: {
          action: 'getClassStudents',
          schoolId,
          classId,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('Unexpected API response structure:', response.data);
        return [];
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to fetch class students:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 특정 학생 조회
   */
  static async getStudent(
    schoolId: string,
    classId: string,
    studentId: string
  ): Promise<Student | null> {
    try {
      if (!schoolId || !classId || !studentId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      const response = await apiClient.get('/student', {
        params: {
          action: 'getStudent',
          schoolId,
          classId,
          studentId,
        },
      });

      return response.data?.data || null;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to fetch student:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 새 학생 등록
   */
  static async enrollStudent(
    schoolId: string,
    classId: string,
    userId: string,
    name: string,
    studentNumber: string,
    email: string
  ): Promise<Student> {
    try {
      if (!schoolId || !classId || !userId || !name || !studentNumber || !email) {
        throw new Error('모든 필드는 필수입니다.');
      }

      const response = await apiClient.post('/student', {
        action: 'enrollStudent',
        schoolId,
        classId,
        userId,
        name,
        studentNumber,
        email,
      });

      if (!response.data?.data) {
        throw new Error('학생 등록에 실패했습니다.');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to enroll student:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 학생 정보 수정
   */
  static async updateStudent(
    schoolId: string,
    classId: string,
    studentId: string,
    updates: Partial<Student>
  ): Promise<Student> {
    try {
      if (!schoolId || !classId || !studentId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('수정할 내용이 없습니다.');
      }

      const response = await apiClient.post('/student', {
        action: 'updateStudent',
        schoolId,
        classId,
        studentId,
        ...updates,
      });

      if (!response.data?.data) {
        throw new Error('학생 정보 수정에 실패했습니다.');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to update student:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 학생 삭제
   */
  static async deleteStudent(
    schoolId: string,
    classId: string,
    studentId: string
  ): Promise<void> {
    try {
      if (!schoolId || !classId || !studentId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      await apiClient.post('/student', {
        action: 'deleteStudent',
        schoolId,
        classId,
        studentId,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to delete student:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export class TimeSlotAPI {
  /**
   * 반의 모든 시간대 조회
   */
  static async getTimeSlots(schoolId: string, classId: string): Promise<TimeSlot[]> {
    try {
      if (!schoolId || !classId) {
        throw new Error('schoolId와 classId는 필수입니다.');
      }

      const response = await apiClient.get('/timeslot', {
        params: {
          action: 'getTimeSlots',
          schoolId,
          classId,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('Unexpected API response structure:', response.data);
        return [];
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to fetch time slots:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 특정 시간대 조회
   */
  static async getTimeSlot(
    schoolId: string,
    classId: string,
    slotId: string
  ): Promise<TimeSlot | null> {
    try {
      if (!schoolId || !classId || !slotId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      const response = await apiClient.get('/timeslot', {
        params: {
          action: 'getTimeSlot',
          schoolId,
          classId,
          slotId,
        },
      });

      return response.data?.data || null;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to fetch time slot:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 새 시간대 생성
   */
  static async createTimeSlot(
    schoolId: string,
    classId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    subject: string
  ): Promise<TimeSlot> {
    try {
      if (!schoolId || !classId || dayOfWeek === undefined || !startTime || !endTime || !subject) {
        throw new Error('모든 필드는 필수입니다.');
      }

      const response = await apiClient.post('/timeslot', {
        action: 'createTimeSlot',
        schoolId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        subject,
      });

      if (!response.data?.data) {
        throw new Error('시간대 생성에 실패했습니다.');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to create time slot:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 시간대 정보 수정
   */
  static async updateTimeSlot(
    schoolId: string,
    classId: string,
    slotId: string,
    updates: Partial<TimeSlot>
  ): Promise<TimeSlot> {
    try {
      if (!schoolId || !classId || !slotId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('수정할 내용이 없습니다.');
      }

      const response = await apiClient.post('/timeslot', {
        action: 'updateTimeSlot',
        schoolId,
        classId,
        slotId,
        ...updates,
      });

      if (!response.data?.data) {
        throw new Error('시간대 수정에 실패했습니다.');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to update time slot:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 시간대 삭제
   */
  static async deleteTimeSlot(
    schoolId: string,
    classId: string,
    slotId: string
  ): Promise<void> {
    try {
      if (!schoolId || !classId || !slotId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      await apiClient.post('/timeslot', {
        action: 'deleteTimeSlot',
        schoolId,
        classId,
        slotId,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Failed to delete time slot:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default apiClient;
