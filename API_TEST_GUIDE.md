# 학생 API 로컬 테스트 가이드

Firebase 연결 없이 로컬에서 Mock 데이터를 사용하여 API를 테스트할 수 있습니다.

## ✨ Mock 모드 활성화

### 방법 1: 자동 테스트 스크립트 실행 (권장)

```bash
# 학생 API 모든 기능 자동 테스트
npx ts-node test-student-api.ts
```

**출력 예시:**
```
=== 학생 API 로컬 테스트 ===

[1] Mock 데이터 확인
Mock 학생 데이터: 3명

[2] 반의 모든 학생 조회 (class-001)
조회된 학생 수: 3명
  1. 박학생 (2024-002) - student2@school.com
  2. 이학생 (2024-001) - student1@school.com
  3. 최학생 (2024-003) - student3@school.com

[3] 특정 학생 조회 (student-001)
✓ 학생명: 이학생
✓ 학번: 2024-001
✓ 이메일: student1@school.com
✓ 상태: active
...
```

### 방법 2: 환경 변수 설정

```bash
# 환경 변수 설정
export USE_MOCK_DATA=true

# Firebase 에뮬레이터 시작 (선택사항)
firebase emulators:start --only functions
```

---

## 📋 Mock 데이터 구조

### Mock 학교
- **schoolId**: `school-001`
- **학교명**: 테스트 중학교

### Mock 반
- **classId**: `class-001`
- **반명**: 1-1
- **담당교사**: 김교사 (user-teacher-001)

### Mock 학생 (초기)
```javascript
{
  id: 'student-001',
  name: '이학생',
  studentNumber: '2024-001',
  email: 'student1@school.com',
  status: 'active'
}
// ... 총 3명
```

### Mock 시간대
- **slot-001**: 월요일 09:00-10:00 (국어)
- **slot-002**: 월요일 10:00-11:00 (수학)

---

## 🧪 API 테스트 명령어

### 1️⃣ 반의 모든 학생 조회

```bash
# Mock 모드에서 테스트하려면
USE_MOCK_DATA=true npx ts-node -e "
import { StudentService } from './functions/src/services/StudentService';
const service = new StudentService();
service.getClassStudents('school-001', 'class-001').then(students => {
  console.log('조회된 학생:', students.map(s => s.name).join(', '));
  console.log('총 ' + students.length + '명');
});
"
```

**또는 더 간단하게:**

```bash
npx ts-node test-student-api.ts | grep -A5 "모든 학생 조회"
```

---

### 2️⃣ 특정 학생 조회

```bash
USE_MOCK_DATA=true npx ts-node -e "
import { StudentService } from './functions/src/services/StudentService';
const service = new StudentService();
service.getStudent('school-001', 'class-001', 'student-001').then(student => {
  console.log('학생:', student.name);
  console.log('학번:', student.studentNumber);
  console.log('이메일:', student.email);
});
"
```

---

### 3️⃣ 새로운 학생 등록

```bash
USE_MOCK_DATA=true npx ts-node -e "
import { StudentService } from './functions/src/services/StudentService';
const service = new StudentService();
service.enrollStudent('school-001', 'class-001', 'user-new-001', '신규학생', '2024-004', 'new@school.com')
  .then(student => {
    console.log('✓ 등록 완료!');
    console.log('학생 ID:', student.id);
    console.log('학생 이름:', student.name);
  })
  .catch(error => {
    console.error('등록 실패:', error.message);
  });
"
```

---

### 4️⃣ 에러 테스트 (존재하지 않는 학생 조회)

```bash
USE_MOCK_DATA=true npx ts-node -e "
import { StudentService } from './functions/src/services/StudentService';
const service = new StudentService();
service.getStudent('school-001', 'class-001', 'student-notfound')
  .catch(error => {
    console.log('에러 발생 (예상됨)');
    console.log('에러 코드:', error.code);
    console.log('에러 메시지:', error.message);
  });
"
```

---

## 🔍 Mock 데이터 확인하기

### Mock 데이터 파일 위치

```
functions/src/infrastructure/mockData.ts
```

### 로컬 메모리 상태 확인

```bash
USE_MOCK_DATA=true npx ts-node -e "
import { mockStudents, mockClasses, mockUsers } from './functions/src/infrastructure/mockData';
console.log('Mock 학교:', Object.keys(mockSchools).length);
console.log('Mock 반:', Object.keys(mockClasses).length);
console.log('Mock 학생:', Object.keys(mockStudents).length);
console.log('Mock 사용자:', Object.keys(mockUsers).length);
"
```

---

## 📊 전체 자동 테스트 실행 (권장)

완전한 테스트 리포트를 보려면:

```bash
npx ts-node test-student-api.ts
```

이 명령은 다음을 자동으로 테스트합니다:
- ✅ Mock 데이터 확인
- ✅ 반의 모든 학생 조회
- ✅ 특정 학생 조회
- ✅ 새로운 학생 등록
- ✅ 학생 목록 재확인
- ✅ 중복 등록 에러 처리
- ✅ 존재하지 않는 학생 에러 처리

---

## 🚀 다음 단계

### Mock 데이터 수정하기

`functions/src/infrastructure/mockData.ts`를 편집해서:

```typescript
export const mockStudents: Record<string, Student> = {
  'student-001': {
    // 여기서 초기 데이터 수정
  },
};
```

### 다른 API 테스트하기

다음 API들도 마찬가지로 mock 지원을 추가할 수 있습니다:

- **ClassService** - 반 관리
- **TimeSlotService** - 시간대 관리
- **AttendanceService** - 출석 관리
- **UserService** - 사용자 관리

### Firebase 연결 시

`USE_MOCK_DATA` 환경 변수를 제거하면 실제 Firebase로 전환됩니다:

```bash
unset USE_MOCK_DATA
firebase emulators:start  # Firebase 에뮬레이터 사용
```

---

## 💡 팁

### 빠른 테스트

```bash
# 자동 테스트 실행
npx ts-node test-student-api.ts

# 결과만 보기 (에러 메시지 제외)
npx ts-node test-student-api.ts 2>/dev/null
```

### VS Code에서 테스트

`launch.json`에 다음 추가:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Student API Test",
  "runtimeExecutable": "npx",
  "runtimeArgs": ["ts-node", "test-student-api.ts"],
  "console": "integratedTerminal"
}
```

그 다음 `F5`를 누르면 테스트 실행!

---

**문제 발생 시:**

```bash
# ts-node 재설치
npm install -g ts-node

# 또는 npx 캐시 초기화
npx -p ts-node ts-node test-student-api.ts
```
