/**
 * Middleware - Authorization
 * 권한 검증 미들웨어
 */

import { User, UserRole } from '../domain/types';
import { ForbiddenError } from '../domain/errors';

/**
 * 특정 역할만 허용하는 미들웨어
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return function (user: User) {
    if (!allowedRoles.includes(user.role)) {
      const rolesStr = allowedRoles.join(', ');
      throw new ForbiddenError(`이 작업은 ${rolesStr} 역할만 가능합니다.`);
    }
  };
}

/**
 * 관리자만 허용
 */
export function requireAdmin(user: User) {
  if (user.role !== 'admin') {
    throw new ForbiddenError('관리자 권한이 필요합니다.');
  }
}

/**
 * 교사 이상만 허용 (교사 또는 관리자)
 */
export function requireTeacherOrAdmin(user: User) {
  if (user.role !== 'teacher' && user.role !== 'admin') {
    throw new ForbiddenError('교사 이상의 권한이 필요합니다.');
  }
}

/**
 * 자신의 학교 데이터만 접근 가능
 */
export function requireSameSchool(user: User, schoolId: string) {
  if (user.schoolId !== schoolId) {
    throw new ForbiddenError('이 학교의 데이터에 접근할 권한이 없습니다.');
  }
}

/**
 * 자신의 데이터만 접근 가능
 */
export function requireSelfOrAdmin(user: User, targetUserId: string) {
  if (user.uid !== targetUserId && user.role !== 'admin') {
    throw new ForbiddenError('자신의 데이터만 접근할 수 있습니다.');
  }
}

/**
 * 권한 검증 헬퍼: 복합 권한 체크
 */
export function authorize(user: User, requirements: {
  roles?: UserRole[];
  mustOwnResource?: boolean;
  requireSchool?: string;
}) {
  // 역할 확인
  if (requirements.roles && !requirements.roles.includes(user.role)) {
    throw new ForbiddenError('이 작업을 수행할 권한이 없습니다.');
  }

  // 학교 확인
  if (requirements.requireSchool && user.schoolId !== requirements.requireSchool) {
    throw new ForbiddenError('이 학교의 데이터에 접근할 권한이 없습니다.');
  }

  return true;
}
