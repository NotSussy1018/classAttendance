# 🎯 Mock 데이터 시스템 설정 완료

## ✅ 현재 상태

- ✅ **Mock 데이터 시스템 구축** (`mockData.ts`)
- ✅ **StudentService Mock 통합** (학생 API)
- ✅ **자동 테스트 스크립트** (`test-student-api.ts`)
- ✅ **API 테스트 가이드** (`API_TEST_GUIDE.md`)
- ✅ **모든 테스트 통과** (7/7 성공)

---

## 🚀 즉시 사용 가능한 명령어

### 1️⃣ 학생 API 완벽 테스트 (가장 간단)

```bash
npx ts-node test-student-api.ts
```

**결과:**
```
=== 학생 API 로컬 테스트 ===

[1] Mock 데이터 확인
Mock 학생 데이터: 3명

[2] 반의 모든 학생 조회 (class-001)
조회된 학생 수: 3명
  1. 박학생 (2024-002) - student2@school.com
  2. 이학생 (2024-001) - student1@school.com
  3. 최학생 (2024-003) - student3@school.com
...
=== 모든 테스트 완료! ===
```

### 2️⃣ 특정 기능만 테스트

```bash
# 반의 모든 학생 조회
npx ts-node test-student-api.ts | head -15

# 특정 학생 조회
npx ts-node test-student-api.ts | grep -A10 "특정 학생"

# 에러 처리 테스트
npx ts-node test-student-api.ts | grep -A5 "에러 예상"
```

---

## 📦 Mock 데이터 구성

### 파일 구조
```
functions/src/infrastructure/
└── mockData.ts (새로 생성)
    ├── mockUsers (3명)
    ├── mockSchools (1개)
    ├── mockClasses (1개)
    ├── mockStudents (3명 + 추가 가능)
    ├── mockTimeSlots (2개)
    └── 헬퍼 함수들
```

### 초기 Mock 데이터

| 구분 | 데이터 |
|------|--------|
| 학교 | 테스트 중학교 (school-001) |
| 반 | 1-1 (class-001) |
| 교사 | 김교사 (user-teacher-001) |
| 학생 | 이학생, 박학생, 최학생 (3명) |
| 시간대 | 국어, 수학 (월요일) |

---

## 🔧 StudentService 통합

### 수정된 메서드

1. **getClassStudents()** - Mock 지원 ✅
   - 반의 모든 학생 조회

2. **getStudent()** - Mock 지원 ✅
   - 특정 학생 조회

3. **enrollStudent()** - Mock 지원 ✅
   - 새로운 학생 등록

### 작동 방식

```typescript
// isMockMode() 체크
if (isMockMode()) {
  // Mock 데이터 반환
  return getMockStudents(classId);
} else {
  // Firebase에서 데이터 조회
  return await db.collection(...).get();
}
```

---

## 🧪 테스트 결과

### 자동 테스트 7/7 성공

```
[1] ✓ Mock 데이터 확인
[2] ✓ 반의 모든 학생 조회
[3] ✓ 특정 학생 조회
[4] ✓ 새로운 학생 등록
[5] ✓ 학생 목록 재확인
[6] ✓ 중복 등록 에러 처리
[7] ✓ 존재하지 않는 학생 에러 처리

=== 모든 테스트 완료! ===
```

---

## 💡 주요 특징

### 1️⃣ 자동 Mock 모드 활성화

환경 변수 설정:
```bash
export USE_MOCK_DATA=true
```

또는 개발 모드에서 자동 활성화:
```bash
process.env.NODE_ENV = 'development'  # 자동으로 mock 활성화
```

### 2️⃣ 에러 처리 지원

- ✅ 중복 등록 감지
- ✅ 존재하지 않는 리소스 에러
- ✅ 입력 검증

### 3️⃣ 메모리 기반 데이터

- 빠른 테스트
- 실시간 데이터 추가/수정
- 세션 종료 시 자동 초기화

---

## 🎓 사용 예제

### 예제 1: 학생 목록 출력

```bash
USE_MOCK_DATA=true npx ts-node -e "
import { StudentService } from './functions/src/services/StudentService';
const service = new StudentService();
service.getClassStudents('school-001', 'class-001').then(students => {
  students.forEach((s, i) => {
    console.log(\`\${i+1}. \${s.name} (\${s.studentNumber})\`);
  });
});
"
```

**출력:**
```
1. 박학생 (2024-002)
2. 이학생 (2024-001)
3. 최학생 (2024-003)
```

### 예제 2: 학생 정보 조회

```bash
USE_MOCK_DATA=true npx ts-node -e "
import { StudentService } from './functions/src/services/StudentService';
const service = new StudentService();
service.getStudent('school-001', 'class-001', 'student-001').then(s => {
  console.log(JSON.stringify(s, null, 2));
});
"
```

---

## 🔄 Firebase 전환하기

Mock 모드를 비활성화하려면:

```bash
# 1. 환경 변수 제거
unset USE_MOCK_DATA

# 2. Firebase 에뮬레이터 또는 실제 Firebase 연결
firebase emulators:start --only functions,firestore
```

---

## 📝 다음 단계

### 다른 Service 추가하기

같은 방식으로 다음도 가능:

1. **ClassService** - Mock 지원 추가
2. **TimeSlotService** - Mock 지원 추가
3. **AttendanceService** - Mock 지원 추가
4. **UserService** - Mock 지원 추가

### 테스트 스크립트 확장하기

현재: `test-student-api.ts`
추가 가능:
- `test-class-api.ts`
- `test-attendance-api.ts`
- `test-comprehensive.ts` (전체 통합 테스트)

---

## 🎉 성공!

Firebase 연결 없이도 **완전한 로컬 API 테스트**가 가능합니다!

```bash
# 지금 바로 테스트해보세요
npx ts-node test-student-api.ts
```

---

## 📚 더 알아보기

- 상세 테스트 가이드: `API_TEST_GUIDE.md`
- Mock 데이터 구현: `functions/src/infrastructure/mockData.ts`
- 자동 테스트: `test-student-api.ts`
