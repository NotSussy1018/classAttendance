/**
 * Service Layer - User Service
 * 사용자 관리 비즈니스 로직
 */

import { db, auth } from '../infrastructure/firebase';
import { User, UserRole } from '../domain/types';
import {
  NotFoundError,
  AlreadyExistsError,
  DatabaseError,
  ValidationError,
} from '../domain/errors';
import {
  validateEmail,
  validateDisplayName,
  validateUserRole,
  validateUserId,
} from '../infrastructure/validators';
import { createAuthUser, setUserClaims } from '../infrastructure/auth';

export class UserService {
  /**
   * 새로운 사용자 생성 (회원가입)
   */
  async createUser(
    email: string,
    password: string,
    displayName: string,
    schoolId: string,
    role: UserRole
  ): Promise<User> {
    // 입력 검증
    validateEmail(email);
    validateDisplayName(displayName);
    validateUserRole(role);

    try {
      // 이메일 중복 확인
      const existingUser = await this.getUserByEmail(email).catch(() => null);
      if (existingUser) {
        throw new AlreadyExistsError('이메일', { email });
      }

      // Firebase Auth 사용자 생성
      const uid = await createAuthUser(email, password, displayName);

      // Firestore에 사용자 문서 생성
      const now = new Date();
      const userData: User = {
        uid,
        email,
        displayName,
        role,
        schoolId,
        createdAt: new Date(now) as any,
        updatedAt: new Date(now) as any,
      };

      await db.collection('users').doc(uid).set(userData);

      // Custom Claims 설정
      await setUserClaims(uid, { role, schoolId });

      return userData;
    } catch (error) {
      if (error instanceof AlreadyExistsError) {
        throw error;
      }
      throw new DatabaseError('사용자 생성 실패', error);
    }
  }

  /**
   * 사용자 정보 조회
   */
  async getUser(userId: string): Promise<User> {
    validateUserId(userId);

    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new NotFoundError('사용자', userId);
      }

      return userDoc.data() as User;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('사용자 조회 실패', error);
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string): Promise<User> {
    validateEmail(email);

    try {
      const querySnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

      if (querySnapshot.empty) {
        throw new NotFoundError('사용자', email);
      }

      const userDoc = querySnapshot.docs[0];
      return userDoc.data() as User;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('사용자 조회 실패', error);
    }
  }

  /**
   * 사용자 프로필 수정
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<{
      displayName: string;
      photoURL?: string;
    }>
  ): Promise<User> {
    validateUserId(userId);

    if (updates.displayName) {
      validateDisplayName(updates.displayName);
    }

    try {
      const user = await this.getUser(userId);

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.collection('users').doc(userId).update(updateData);

      // Firebase Auth 사용자 정보 업데이트
      if (updates.displayName || updates.photoURL) {
        await auth.updateUser(userId, {
          displayName: updates.displayName,
          photoURL: updates.photoURL,
        });
      }

      return { ...user, ...updateData } as User;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('사용자 수정 실패', error);
    }
  }

  /**
   * 사용자 역할 설정
   */
  async setUserRole(userId: string, role: UserRole): Promise<void> {
    validateUserId(userId);
    validateUserRole(role);

    try {
      const user = await this.getUser(userId);

      await db.collection('users').doc(userId).update({
        role,
        updatedAt: new Date(),
      });

      // Custom Claims 업데이트
      await setUserClaims(userId, { role, schoolId: user.schoolId });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('역할 설정 실패', error);
    }
  }

  /**
   * 학교 소속 모든 사용자 조회
   */
  async getUsersBySchool(schoolId: string, role?: UserRole): Promise<User[]> {
    if (!schoolId || typeof schoolId !== 'string') {
      throw new ValidationError('유효한 학교 ID가 필요합니다.');
    }

    try {
      let query = db.collection('users').where('schoolId', '==', schoolId);

      if (role) {
        query = query.where('role', '==', role);
      }

      const querySnapshot = await query.get();
      return querySnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      throw new DatabaseError('사용자 목록 조회 실패', error);
    }
  }

  /**
   * 특정 역할의 사용자 수 조회
   */
  async getUserCountByRole(schoolId: string, role: UserRole): Promise<number> {
    try {
      const querySnapshot = await db
        .collection('users')
        .where('schoolId', '==', schoolId)
        .where('role', '==', role)
        .count()
        .get();

      return querySnapshot.data().count;
    } catch (error) {
      throw new DatabaseError('사용자 수 조회 실패', error);
    }
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string): Promise<void> {
    validateUserId(userId);

    try {
      // Firestore에서 삭제
      await db.collection('users').doc(userId).delete();

      // Firebase Auth에서 삭제
      await auth.deleteUser(userId);
    } catch (error) {
      // 사용자가 없어도 계속 진행 (이미 삭제된 상태)
      if ((error as any).code !== 'auth/user-not-found') {
        throw new DatabaseError('사용자 삭제 실패', error);
      }
    }
  }
}

// Singleton 인스턴스
export const userService = new UserService();
