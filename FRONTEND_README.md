# School Attendance Tracker - Frontend

## 📋 개요

React + Vite + Tailwind CSS로 구축된 학교 출석 추적 시스템의 프론트엔드

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

### 서버 실행

**동시에 두 개의 서버를 실행해야 합니다:**

1. **API 서버** (백엔드)
   ```bash
   cd functions
   node local-server.js
   ```
   포트: http://localhost:3000

2. **프론트엔드** (React)
   ```bash
   npm run dev
   ```
   포트: http://localhost:5173

## 🏗️ 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Navigation.tsx   # 네비게이션 바
│   ├── HeroSection.tsx  # 히어로 섹션
│   ├── StatCard.tsx     # 통계 카드
│   ├── ClassCard.tsx    # 클래스 카드
│   └── StudentTable.tsx # 학생 테이블
├── pages/
│   └── Dashboard.tsx    # 메인 대시보드
├── lib/
│   └── api.ts          # API 클라이언트
├── types/
│   └── index.ts        # TypeScript 타입
├── styles/
│   └── globals.css     # 글로벌 스타일
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx            # 엔트리 포인트

// 설정 파일
├── vite.config.ts      # Vite 설정
├── tailwind.config.js  # Tailwind CSS 설정
├── postcss.config.js   # PostCSS 설정
├── tsconfig.json       # TypeScript 설정
├── .env                # 환경 변수
└── index.html          # HTML 엔트리 포인트
```

## 🔧 환경 변수 설정

`.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```env
# API 엔드포인트
VITE_API_URL=http://localhost:3000/api

# 학교 ID (Mock 데이터 사용 시)
VITE_SCHOOL_ID=school-001

# 클래스 ID (Mock 데이터 사용 시)
VITE_CLASS_ID=class-001
```

## 📦 주요 의존성

- **React 19** - UI 라이브러리
- **TypeScript** - 정적 타입 지원
- **Vite** - 빌드 도구
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **Axios** - HTTP 클라이언트
- **@vitejs/plugin-react** - React 플러그인

## 🎨 설계 패턴

### API 클라이언트 (`StudentAPI`)

모든 API 요청은 `src/lib/api.ts`의 `StudentAPI` 클래스를 통해 처리됩니다.

**특징:**
- 자동 에러 처리 및 유효성 검사
- 명확한 에러 메시지
- 타입 안전성

**사용 예:**

```typescript
// 학생 목록 조회
const students = await StudentAPI.getClassStudents('school-001', 'class-001');

// 새 학생 등록
const newStudent = await StudentAPI.enrollStudent(
  'school-001',
  'class-001',
  'user-123',
  '김학생',
  '2024-001',
  'student@school.com'
);
```

### 컴포넌트 구조

**Server/Client Components:**
- 클라이언트 컴포넌트는 `'use client'` 지시어 사용
- 상태 관리와 이벤트 핸들링은 클라이언트에서

**Props 타입:**
```typescript
interface ComponentProps {
  // 명확하게 타입 정의된 props
}
```

## 🔍 에러 처리

### API 에러

모든 API 호출은 다음과 같이 처리됩니다:

```typescript
try {
  const data = await StudentAPI.getClassStudents(schoolId, classId);
  // 성공 처리
} catch (error) {
  const errorMsg = error instanceof Error
    ? error.message
    : '알 수 없는 오류';
  // 에러 처리
}
```

### 사용자 피드백

- 로딩 상태: 스피너 표시
- 에러 상태: 빨간색 알림 박스
- 빈 상태: 친절한 메시지

## 🎯 주요 기능

### 대시보드
- 📊 전체 통계 (전체 학생, 현황 학생, 출석률, 클래스 수)
- 📚 클래스 정보 및 학생 현황
- 👥 학생 목록 (테이블 형식)

### 학생 관리
- ✅ 학생 목록 조회
- ➕ 새 학생 등록
- ✏️ 학생 정보 수정
- 🗑️ 학생 삭제

## 📱 반응형 디자인

- **모바일**: 단일 칼럼 레이아웃
- **태블릿**: 2-3 칼럼 레이아웃
- **데스크톱**: 4 칼럼 레이아웃

## ♿ 접근성 (A11y)

- 시맨틱 HTML 사용
- ARIA 라벨 및 역할
- 키보드 네비게이션 지원
- 포커스 스타일 포함

## 🧪 테스트

현재 Mock 데이터로 테스트 중입니다.

```bash
# API 로컬 서버에서 Mock 데이터 제공
# http://localhost:3000/api/student
```

## 📝 라이선스

ISC

## 🤝 기여

이 프로젝트는 학생 출석 추적 시스템 개발용입니다.

## 📞 지원

문제가 발생하면 백엔드 문서를 확인하세요:
- 백엔드 README: `/functions/README.md`
- API 테스트: `/functions/API_TEST_GUIDE.md`
