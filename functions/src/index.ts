/**
 * Cloud Functions Entry Point
 * 모든 HTTP 트리거 함수의 진입점
 */

import * as functions from 'firebase-functions';
import { initializeFirebase } from './infrastructure/firebase';

// Firebase 초기화
initializeFirebase();

// Controller 임포트
import * as userControllers from './controllers/userController';
import * as schoolControllers from './controllers/schoolController';
import * as classControllers from './controllers/classController';
import * as timeSlotControllers from './controllers/timeSlotController';
import * as studentControllers from './controllers/studentController';
import * as attendanceControllers from './controllers/attendanceController';

// API 임포트
import { studentApi } from './api/studentTestApi';

// ==================== User Controllers ====================
export const createUser = functions.https.onCall(userControllers.createUser);
export const getUser = functions.https.onCall(userControllers.getUser);
export const updateUserProfile = functions.https.onCall(userControllers.updateUserProfile);
export const getUserByEmail = functions.https.onCall(userControllers.getUserByEmail);
export const setUserRole = functions.https.onCall(userControllers.setUserRole);

// ==================== School Controllers ====================
export const createSchool = functions.https.onCall(schoolControllers.createSchool);
export const getSchool = functions.https.onCall(schoolControllers.getSchool);
export const updateSchool = functions.https.onCall(schoolControllers.updateSchool);
export const deleteSchool = functions.https.onCall(schoolControllers.deleteSchool);
export const getSchoolClasses = functions.https.onCall(schoolControllers.getSchoolClasses);
export const getSchoolUsers = functions.https.onCall(schoolControllers.getSchoolUsers);
export const getSchoolUserCount = functions.https.onCall(schoolControllers.getSchoolUserCount);

// ==================== Class Controllers ====================
export const createClass = functions.https.onCall(classControllers.createClass);
export const getClass = functions.https.onCall(classControllers.getClass);
export const updateClass = functions.https.onCall(classControllers.updateClass);
export const deleteClass = functions.https.onCall(classControllers.deleteClass);
export const getTeacherClasses = functions.https.onCall(classControllers.getTeacherClasses);
export const transferClassTeacher = functions.https.onCall(classControllers.transferClassTeacher);

// ==================== TimeSlot Controllers ====================
export const createTimeSlot = functions.https.onCall(timeSlotControllers.createTimeSlot);
export const getTimeSlot = functions.https.onCall(timeSlotControllers.getTimeSlot);
export const getTimeSlots = functions.https.onCall(timeSlotControllers.getTimeSlots);
export const getTimeSlotsByDay = functions.https.onCall(timeSlotControllers.getTimeSlotsByDay);
export const updateTimeSlot = functions.https.onCall(timeSlotControllers.updateTimeSlot);
export const deleteTimeSlot = functions.https.onCall(timeSlotControllers.deleteTimeSlot);

// ==================== Student Controllers ====================
export const enrollStudent = functions.https.onCall(studentControllers.enrollStudent);
export const getStudent = functions.https.onCall(studentControllers.getStudent);
export const updateStudent = functions.https.onCall(studentControllers.updateStudent);
export const removeStudent = functions.https.onCall(studentControllers.removeStudent);
export const deactivateStudent = functions.https.onCall(studentControllers.deactivateStudent);
export const getClassStudents = functions.https.onCall(studentControllers.getClassStudents);
export const getStudentClasses = functions.https.onCall(studentControllers.getStudentClasses);

// ==================== Attendance Controllers ====================
export const recordSingleAttendance = functions.https.onCall(
  attendanceControllers.recordSingleAttendance
);
export const recordAttendance = functions.https.onCall(attendanceControllers.recordAttendance);
export const getAttendanceByDate = functions.https.onCall(attendanceControllers.getAttendanceByDate);
export const getStudentAttendance = functions.https.onCall(
  attendanceControllers.getStudentAttendance
);
export const updateAttendanceStatus = functions.https.onCall(
  attendanceControllers.updateAttendanceStatus
);
export const deleteAttendance = functions.https.onCall(attendanceControllers.deleteAttendance);
export const getMonthlyAttendance = functions.https.onCall(
  attendanceControllers.getMonthlyAttendance
);
export const getClassAttendanceByTimeSlot = functions.https.onCall(
  attendanceControllers.getClassAttendanceByTimeSlot
);

// ==================== Test API Endpoints ====================
export const studentTestApi = functions.https.onRequest(studentApi);
