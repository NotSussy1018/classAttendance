/**
 * Infrastructure Layer - Firebase Initialization
 * Firebase Admin SDK 초기화
 */

import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화
 * 환경에 따라 자동으로 서비스 계정 인증을 처리함
 */
let app: admin.app.App;

if (!admin.apps.length) {
  app = admin.initializeApp();
} else {
  app = admin.app();
}

// Firestore 인스턴스 생성
export const db = admin.firestore();

// Authentication 인스턴스 생성
export const auth = admin.auth();

// 초기 설정
export function initializeFirebase() {
  // Firestore 캐시 활성화
  db.settings({
    ignoreUndefinedProperties: true,
  });

  return { db, auth };
}

// 기본값 내보내기
export default admin;
