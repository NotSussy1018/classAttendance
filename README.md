# School Attendance Tracker - Backend

Firebase Cloud Functions 기반 학교 출석 트래커 백엔드 시스템입니다.

## 📋 프로젝트 구조

```
functions/src/
├── index.ts                    # Cloud Functions 진입점
├── domain/                     # 도메인 모델
│   ├── types.ts               # TypeScript 인터페이스
│   ├── constants.ts           # 상수 및 에러 코드
│   └── errors.ts              # 커스텀 에러 클래스
├── infrastructure/             # 기반 시설
│   ├── firebase.ts            # Firebase 초기화
│   ├── auth.ts                # 인증/권한 관련 함수
│   ├── validators.ts          # 입력 검증
│   └── responses.ts           # 표준 응답 포맷
├── services/                  # 비즈니스 로직
│   ├── UserService.ts
│   ├── SchoolService.ts
│   ├── ClassService.ts
│   ├── TimeSlotService.ts
│   ├── StudentService.ts
│   └── AttendanceService.ts
├── controllers/               # HTTP 핸들러
│   ├── userController.ts
│   ├── schoolController.ts
│   ├── classController.ts
│   ├── timeSlotController.ts
│   ├── studentController.ts
│   └── attendanceController.ts
└── middleware/                # 미들웨어
    ├── authenticate.ts        # 인증
    ├── authorize.ts           # 권한
    └── errorHandler.ts        # 에러 처리
```

## 🏗️ 아키텍처

### 계층 분리

```
Controller Layer (HTTP 요청)
    ↓
Service Layer (비즈니스 로직)
    ↓
Infrastructure Layer (DB, 인증)
    ↓
Firestore & Firebase Auth
```

### 데이터 모델

#### users (전역)
```
users/{userId}
├── email: string
├── displayName: string
├── role: 'admin' | 'teacher' | 'student'
├── schoolId: string
├── photoURL?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### schools (전역)
```
schools/{schoolId}
├── name: string
├── address: string
├── adminId: string
├── phoneNumber?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### classes (학교별)
```
schools/{schoolId}/classes/{classId}
├── name: string (예: '1-1')
├── teacherId: string
├── gradeLevel: number
├── maxStudents: number
├── description?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### timeslots (반별)
```
schools/{schoolId}/classes/{classId}/timeslots/{slotId}
├── dayOfWeek: number (0-6)
├── startTime: string (HH:mm)
├── endTime: string (HH:mm)
├── subject: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### students (반별)
```
schools/{schoolId}/classes/{classId}/students/{studentId}
├── userId: string
├── name: string
├── studentNumber: string
├── email: string
├── status: 'active' | 'inactive'
├── enrolledAt: timestamp
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### attendances (날짜별 분할 저장)
```
schools/{schoolId}/classes/{classId}/attendances/{date}/{studentId}
├── date: string (YYYY-MM-DD)
├── timeslotId: string
├── status: 'present' | 'absent' | 'tardy' | 'excused'
├── recordedBy: string (teacherId)
├── notes?: string
├── recordedAt: timestamp
└── updatedAt: timestamp
```

## 🔐 보안

### Firestore Rules
- **Role 기반 접근 제어**: User의 role에 따라 권한 결정
- **학교별 격리**: 학교 ID로 데이터 완전히 분리
- **담당 교사 제한**: 반의 담당 교사만 출석 관리 가능
- **학생 제한**: 학생은 자신의 데이터만 접근 가능

### 인증
- Firebase Auth로 사용자 인증
- Custom Claims로 role 저장
- 모든 API 호출에 인증 토큰 필요

## 📡 API 엔드포인트

### User Management
```
POST   /api/v1/users                    # 사용자 생성
GET    /api/v1/users/:userId           # 사용자 정보 조회
PUT    /api/v1/users/:userId           # 프로필 수정
GET    /api/v1/users/email/:email      # 이메일로 조회
POST   /api/v1/users/:userId/role      # 역할 설정 (관리자만)
```

### School Management
```
POST   /api/v1/schools                          # 학교 생성
GET    /api/v1/schools/:schoolId               # 학교 정보 조회
PUT    /api/v1/schools/:schoolId               # 학교 정보 수정
DELETE /api/v1/schools/:schoolId               # 학교 삭제
GET    /api/v1/schools/:schoolId/classes       # 학교 반 목록
GET    /api/v1/schools/:schoolId/users         # 학교 사용자 목록
```

### Class Management
```
POST   /api/v1/schools/:schoolId/classes                    # 반 생성
GET    /api/v1/schools/:schoolId/classes/:classId          # 반 정보 조회
PUT    /api/v1/schools/:schoolId/classes/:classId          # 반 정보 수정
DELETE /api/v1/schools/:schoolId/classes/:classId          # 반 삭제
GET    /api/v1/teachers/:teacherId/classes                 # 담당 반 목록
```

### TimeSlot Management
```
POST   /api/v1/schools/:schoolId/classes/:classId/timeslots
GET    /api/v1/schools/:schoolId/classes/:classId/timeslots
PUT    /api/v1/schools/:schoolId/classes/:classId/timeslots/:slotId
DELETE /api/v1/schools/:schoolId/classes/:classId/timeslots/:slotId
```

### Student Management
```
POST   /api/v1/schools/:schoolId/classes/:classId/students
GET    /api/v1/schools/:schoolId/classes/:classId/students
PUT    /api/v1/schools/:schoolId/classes/:classId/students/:studentId
DELETE /api/v1/schools/:schoolId/classes/:classId/students/:studentId
GET    /api/v1/students/:studentId/classes
```

### Attendance Management
```
POST   /api/v1/schools/:schoolId/classes/:classId/attendance/record     # 일괄 기록
POST   /api/v1/schools/:schoolId/classes/:classId/attendance           # 개별 기록
GET    /api/v1/schools/:schoolId/classes/:classId/attendance/:date     # 날짜별 조회
GET    /api/v1/schools/:schoolId/classes/:classId/students/:studentId/attendance
PUT    /api/v1/schools/:schoolId/classes/:classId/attendance/:date/:studentId
DELETE /api/v1/schools/:schoolId/classes/:classId/attendance/:date/:studentId
```

## 🚀 배포

### 사전 요구사항
- Firebase 프로젝트 생성
- Firebase CLI 설치 (`npm install -g firebase-tools`)
- 로컬 환경에 구성

### 배포 단계

1. **Firebase 인증**
```bash
firebase login
firebase use your-project-id
```

2. **함수 빌드**
```bash
cd functions
npm install
npm run build
```

3. **배포**
```bash
firebase deploy --only functions,firestore:rules,firestore:indexes
```

4. **Firestore 인덱스 생성**
- 첫 배포 시 콘솔에서 인덱스 생성 링크 제공

## 🧪 테스트

### 로컬 에뮬레이터로 테스트
```bash
firebase emulators:start
```

### API 테스트 예제 (Postman/Thunder Client)
```json
{
  "email": "teacher@school.com",
  "password": "password123",
  "displayName": "Teacher Name",
  "schoolId": "school-001",
  "role": "teacher"
}
```

## 📝 개발 가이드

### 새로운 Service 추가
1. `services/` 디렉토리에 `*Service.ts` 파일 생성
2. Service 클래스에 비즈니스 로직 구현
3. `controllers/` 디렉토리에 controller 생성
4. `index.ts`에 Cloud Functions export 추가

### 새로운 Collection 추가
1. `domain/types.ts`에 인터페이스 정의
2. `firestore.rules`에 보안 규칙 추가
3. Service에서 데이터 접근 로직 구현
4. Controller 추가

## 🔄 Phase 2 (통계 및 알림)

향후 구현할 기능:
- StatisticsService: 출석률 계산 및 통계
- NotificationService: 푸시 알림
- Cloud Scheduler: 야간 배치 작업

## 📚 참고

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [TypeScript 가이드](https://www.typescriptlang.org/docs/)
