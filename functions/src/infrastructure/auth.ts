/**
 * Infrastructure Layer - Authentication Helpers
 * Firebase 인증 검증 및 사용자 정보 추출
 */

import { auth, db } from './firebase';
import { AuthError, ForbiddenError, NotFoundError } from '../domain/errors';
import { User, UserRole } from '../domain/types';
import { ERROR_CODES } from '../domain/constants';

/**
 * 요청에서 인증 토큰 추출 및 검증
 */
export async function verifyToken(token: string): Promise<string> {
  if (!token) {
    throw new AuthError(ERROR_CODES.AUTH_MISSING_TOKEN);
  }

  try {
    // Firebase 토큰 검증 및 UID 추출
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new AuthError(ERROR_CODES.AUTH_INVALID_TOKEN, 'Invalid or expired token');
  }
}

/**
 * 요청에서 현재 사용자 정보 조회
 */
export async function getCurrentUser(uid: string): Promise<User> {
  try {
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new NotFoundError('사용자');
    }

    const userData = userDoc.data() as User;
    return userData;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new AuthError(ERROR_CODES.AUTH_USER_NOT_FOUND);
  }
}

/**
 * 특정 사용자의 역할 확인
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  const user = await getCurrentUser(uid);
  return user.role;
}

/**
 * 사용자가 특정 학교에 속하는지 확인
 */
export async function verifyUserInSchool(uid: string, schoolId: string): Promise<boolean> {
  const user = await getCurrentUser(uid);
  return user.schoolId === schoolId;
}

/**
 * 교사가 특정 반을 담당하는지 확인
 */
export async function verifyTeacherOwnsClass(
  teacherId: string,
  schoolId: string,
  classId: string
): Promise<boolean> {
  try {
    const classDoc = await db.collection(`schools/${schoolId}/classes`).doc(classId).get();

    if (!classDoc.exists) {
      return false;
    }

    const classData = classDoc.data();
    return classData?.teacherId === teacherId;
  } catch (error) {
    return false;
  }
}

/**
 * 학생이 특정 반에 등록되어 있는지 확인
 */
export async function verifyStudentInClass(
  studentId: string,
  schoolId: string,
  classId: string
): Promise<boolean> {
  try {
    const studentDoc = await db
      .collection(`schools/${schoolId}/classes/${classId}/students`)
      .doc(studentId)
      .get();

    return studentDoc.exists;
  } catch (error) {
    return false;
  }
}

/**
 * 권한 검증 - 관리자 확인
 */
export async function requireAdmin(uid: string): Promise<void> {
  const role = await getUserRole(uid);
  if (role !== 'admin') {
    throw new ForbiddenError('관리자 권한이 필요합니다.');
  }
}

/**
 * 권한 검증 - 교사 또는 관리자 확인
 */
export async function requireTeacherOrAdmin(uid: string): Promise<void> {
  const role = await getUserRole(uid);
  if (role !== 'teacher' && role !== 'admin') {
    throw new ForbiddenError('교사 이상의 권한이 필요합니다.');
  }
}

/**
 * 권한 검증 - 학교 내에서의 권한 확인
 */
export async function requireAccessToSchool(
  uid: string,
  schoolId: string,
  requiredRole?: UserRole
): Promise<User> {
  const user = await getCurrentUser(uid);

  // 학교 소속 확인
  if (user.schoolId !== schoolId) {
    throw new ForbiddenError('이 학교에 접근할 권한이 없습니다.');
  }

  // 특정 역할 필요시 확인
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    throw new ForbiddenError(`${requiredRole} 권한이 필요합니다.`);
  }

  return user;
}

/**
 * 권한 검증 - 반에 대한 접근 권한 확인
 */
export async function requireAccessToClass(
  uid: string,
  schoolId: string,
  classId: string
): Promise<User> {
  const user = await requireAccessToSchool(uid, schoolId);

  // 교사인 경우, 자신이 담당하는 반인지 확인
  if (user.role === 'teacher') {
    const ownsClass = await verifyTeacherOwnsClass(uid, schoolId, classId);
    if (!ownsClass) {
      throw new ForbiddenError('이 반에 접근할 권한이 없습니다.');
    }
  }

  return user;
}

/**
 * 권한 검증 - 학생의 출석 데이터에 접근
 */
export async function requireAccessToStudentAttendance(
  uid: string,
  schoolId: string,
  classId: string,
  studentId: string
): Promise<User> {
  const user = await requireAccessToClass(uid, schoolId, classId);

  // 학생인 경우, 자신의 데이터만 접근 가능
  if (user.role === 'student') {
    const studentDoc = await db
      .collection(`schools/${schoolId}/classes/${classId}/students`)
      .doc(studentId)
      .get();

    if (!studentDoc.exists || studentDoc.data()?.userId !== uid) {
      throw new ForbiddenError('이 데이터에 접근할 권한이 없습니다.');
    }
  }

  return user;
}

/**
 * Firebase Auth 사용자 생성
 */
export async function createAuthUser(
  email: string,
  password: string,
  displayName?: string
): Promise<string> {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      throw new Error('이미 가입된 이메일입니다.');
    }
    throw error;
  }
}

/**
 * Firebase Auth 사용자 삭제
 */
export async function deleteAuthUser(uid: string): Promise<void> {
  try {
    await auth.deleteUser(uid);
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }
}

/**
 * Custom Claims 설정 (역할)
 */
export async function setUserClaims(uid: string, claims: Record<string, any>): Promise<void> {
  try {
    await auth.setCustomUserClaims(uid, claims);
  } catch (error) {
    throw new Error('Failed to set user claims: ' + (error as any).message);
  }
}
