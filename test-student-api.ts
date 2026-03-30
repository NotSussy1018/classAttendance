/**
 * 학생 API 로컬 테스트 스크립트
 *
 * 사용법:
 * 1. npx ts-node test-student-api.ts
 * 또는
 * 2. npm install -g ts-node (전역 설치 후)
 *    ts-node test-student-api.ts
 */

// Mock 모드 활성화
process.env.USE_MOCK_DATA = 'true';
process.env.NODE_ENV = 'development';

import { StudentService } from './functions/src/services/StudentService';
import { getMockStudents, getMockStudent, mockStudents } from './functions/src/infrastructure/mockData';

const studentService = new StudentService();

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * 테스트 실행
 */
async function runTests() {
  console.log(`\n${colors.cyan}=== 학생 API 로컬 테스트 ===${colors.reset}\n`);

  try {
    // 1. Mock 데이터 확인
    console.log(`${colors.blue}[1] Mock 데이터 확인${colors.reset}`);
    console.log(`Mock 학생 데이터: ${Object.keys(mockStudents).length}명\n`);

    // 2. 반의 모든 학생 조회
    console.log(`${colors.blue}[2] 반의 모든 학생 조회 (class-001)${colors.reset}`);
    const allStudents = await studentService.getClassStudents('school-001', 'class-001');
    console.log(`조회된 학생 수: ${allStudents.length}명`);
    allStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.name} (${student.studentNumber}) - ${student.email}`);
    });
    console.log();

    // 3. 특정 학생 조회
    console.log(`${colors.blue}[3] 특정 학생 조회 (student-001)${colors.reset}`);
    const student = await studentService.getStudent('school-001', 'class-001', 'student-001');
    console.log(`${colors.green}✓${colors.reset} 학생명: ${student.name}`);
    console.log(`${colors.green}✓${colors.reset} 학번: ${student.studentNumber}`);
    console.log(`${colors.green}✓${colors.reset} 이메일: ${student.email}`);
    console.log(`${colors.green}✓${colors.reset} 상태: ${student.status}`);
    console.log();

    // 4. 학생 등록 (새로운 학생)
    console.log(`${colors.blue}[4] 새로운 학생 등록${colors.reset}`);
    const newStudent = await studentService.enrollStudent(
      'school-001',
      'class-001',
      'user-test-001',
      '테스트학생',
      '2024-999',
      'test@school.com'
    );
    console.log(`${colors.green}✓${colors.reset} 등록 완료!`);
    console.log(`  ID: ${newStudent.id}`);
    console.log(`  이름: ${newStudent.name}`);
    console.log(`  학번: ${newStudent.studentNumber}`);
    console.log();

    // 5. 학생 목록 다시 확인 (등록된 학생 포함)
    console.log(`${colors.blue}[5] 학생 목록 재확인 (새 학생 포함)${colors.reset}`);
    const updatedStudents = await studentService.getClassStudents('school-001', 'class-001');
    console.log(`총 학생 수: ${updatedStudents.length}명`);
    updatedStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.name} (${student.studentNumber})`);
    });
    console.log();

    // 6. 중복 등록 시도 (에러 처리)
    console.log(`${colors.blue}[6] 중복 등록 테스트 (에러 예상)${colors.reset}`);
    try {
      await studentService.enrollStudent(
        'school-001',
        'class-001',
        'user-student-001', // 이미 등록된 사용자
        'duplicate',
        '2024-dup',
        'dup@school.com'
      );
      console.log(`${colors.red}✗${colors.reset} 에러가 발생하지 않았습니다!`);
    } catch (error: any) {
      console.log(`${colors.green}✓${colors.reset} 예상된 에러 발생`);
      console.log(`  에러 코드: ${error.code}`);
      console.log(`  에러 메시지: ${error.message}`);
    }
    console.log();

    // 7. 없는 학생 조회 (에러 처리)
    console.log(`${colors.blue}[7] 존재하지 않는 학생 조회 (에러 예상)${colors.reset}`);
    try {
      await studentService.getStudent('school-001', 'class-001', 'student-notfound');
      console.log(`${colors.red}✗${colors.reset} 에러가 발생하지 않았습니다!`);
    } catch (error: any) {
      console.log(`${colors.green}✓${colors.reset} 예상된 에러 발생`);
      console.log(`  에러 코드: ${error.code}`);
      console.log(`  에러 메시지: ${error.message}`);
    }
    console.log();

    console.log(`${colors.green}=== 모든 테스트 완료! ===${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}테스트 실패:${colors.reset}`, error);
  }
}

// 테스트 실행
runTests();
