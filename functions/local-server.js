/**
 * Local Development Server
 * 로컬에서 Student API를 테스트하기 위한 Express 서버
 * 실행: node local-server.js
 */

const express = require('express');
const app = express();
const port = 3000;

// Mock 데이터 활성화 설정
process.env.USE_MOCK_DATA = 'true';
process.env.NODE_ENV = 'development';

// Firebase 초기화 (에뮬레이터 사용)
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Firebase 및 서비스 초기화
require('./lib/infrastructure/firebase').initializeFirebase();

const { studentApi } = require('./lib/api/studentTestApi');
const { timeSlotApi } = require('./lib/api/timeSlotTestApi');

// ===== CORS 설정 (모든 미들웨어보다 먼저 실행) =====
app.use((req, res, next) => {
  // 요청 출처 확인
  const origin = req.headers.origin || '*';

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '3600');

  // OPTIONS 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// JSON 파싱 미들웨어
app.use(express.json());

// URL 인코딩 미들웨어 (GET 파라미터 처리)
app.use(express.urlencoded({ extended: true }));

// API 라우트
app.get('/api/student', (req, res) => {
  studentApi(req, res);
});

app.post('/api/student', (req, res) => {
  studentApi(req, res);
});

app.get('/api/timeslot', (req, res) => {
  timeSlotApi(req, res);
});

app.post('/api/timeslot', (req, res) => {
  timeSlotApi(req, res);
});

// 기본 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>학생 API 테스트</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        h1 {
          color: white;
          margin-bottom: 30px;
          text-align: center;
          font-size: 32px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .button-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        button {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #667eea;
          color: white;
        }

        button:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .result {
          background: #f5f5f5;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
          max-height: 500px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .result.error {
          border-left-color: #ff6b6b;
          background: #fff5f5;
          color: #c92a2a;
        }

        .result.success {
          border-left-color: #51cf66;
          background: #f1fdf7;
          color: #2b8a3e;
        }

        .info {
          background: #e7f3ff;
          border-left: 4px solid #1890ff;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          color: #0050b3;
          font-size: 13px;
          line-height: 1.6;
        }

        .input-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 5px;
          color: #555;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .api-url {
          background: #f0f0f0;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          word-break: break-all;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 학생 API 테스트</h1>

        <div class="card">
          <div class="info">
            ✅ Mock 데이터를 사용하여 로컬에서 API를 테스트하고 있습니다.<br>
            학교 ID와 반 ID는 기본값으로 설정되어 있습니다: school-001, class-001
          </div>

          <div class="section-title">기본 파라미터</div>
          <div class="input-group">
            <div>
              <label for="schoolId">학교 ID</label>
              <input type="text" id="schoolId" value="school-001" placeholder="학교 ID">
            </div>
            <div>
              <label for="classId">반 ID</label>
              <input type="text" id="classId" value="class-001" placeholder="반 ID">
            </div>
          </div>

          <div class="section-title">조회 API</div>
          <div class="button-group">
            <button onclick="testGetClassStudents()">반의 모든 학생 조회</button>
            <button onclick="testGetStudent()">특정 학생 조회</button>
            <button onclick="testGetStudentClasses()">학생의 모든 반 조회</button>
          </div>

          <div class="section-title">학생 등록/수정</div>
          <div class="input-group">
            <div>
              <label for="userId">사용자 ID</label>
              <input type="text" id="userId" value="user-student-001" placeholder="사용자 ID">
            </div>
            <div>
              <label for="studentId">학생 ID (수정/삭제 시)</label>
              <input type="text" id="studentId" value="student-001" placeholder="학생 ID">
            </div>
            <div>
              <label for="name">이름</label>
              <input type="text" id="name" value="테스트 학생" placeholder="학생 이름">
            </div>
            <div>
              <label for="studentNumber">학번</label>
              <input type="text" id="studentNumber" value="2024-999" placeholder="학번">
            </div>
            <div>
              <label for="email">이메일</label>
              <input type="text" id="email" value="test@school.com" placeholder="이메일">
            </div>
          </div>

          <div class="button-group">
            <button onclick="testEnrollStudent()">학생 등록</button>
            <button onclick="testUpdateStudent()">학생 정보 수정</button>
            <button onclick="testDeactivateStudent()">학생 비활성화</button>
            <button onclick="testRemoveStudent()">학생 삭제</button>
          </div>

          <div id="resultContainer"></div>
        </div>
      </div>

      <script>
        const API_BASE = '/api/student';

        function updateUrlDisplay(url) {
          const resultContainer = document.getElementById('resultContainer');
          const existingUrl = resultContainer.querySelector('.api-url');
          if (existingUrl) existingUrl.remove();

          const urlDiv = document.createElement('div');
          urlDiv.className = 'api-url';
          urlDiv.textContent = 'URL: ' + url;
          resultContainer.insertBefore(urlDiv, resultContainer.firstChild);
        }

        function showResult(data, isError = false) {
          const resultContainer = document.getElementById('resultContainer');
          const resultDiv = document.createElement('div');
          resultDiv.className = \`result \${isError ? 'error' : 'success'}\`;
          resultDiv.textContent = JSON.stringify(data, null, 2);
          resultContainer.innerHTML = '';
          resultContainer.appendChild(resultDiv);
        }

        async function makeRequest(action, params = {}) {
          const schoolId = document.getElementById('schoolId').value;
          const classId = document.getElementById('classId').value;

          const url = new URL(API_BASE, window.location.href);
          url.searchParams.append('action', action);
          url.searchParams.append('schoolId', schoolId);
          url.searchParams.append('classId', classId);

          Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
          });

          updateUrlDisplay(url.toString());

          try {
            const response = await fetch(url.toString());
            const data = await response.json();
            showResult(data, !response.ok);
          } catch (error) {
            showResult({ error: error.message }, true);
          }
        }

        function testGetClassStudents() {
          makeRequest('getClassStudents');
        }

        function testGetStudent() {
          const studentId = document.getElementById('studentId').value;
          if (!studentId) {
            alert('학생 ID를 입력하세요');
            return;
          }
          makeRequest('getStudent', { studentId });
        }

        function testGetStudentClasses() {
          const studentId = document.getElementById('studentId').value;
          if (!studentId) {
            alert('학생 ID를 입력하세요');
            return;
          }
          makeRequest('getStudentClasses', { studentId });
        }

        function testEnrollStudent() {
          const userId = document.getElementById('userId').value;
          const name = document.getElementById('name').value;
          const studentNumber = document.getElementById('studentNumber').value;
          const email = document.getElementById('email').value;

          if (!userId || !name || !studentNumber || !email) {
            alert('모든 필드를 입력하세요');
            return;
          }

          makeRequest('enrollStudent', { userId, name, studentNumber, email });
        }

        function testUpdateStudent() {
          const studentId = document.getElementById('studentId').value;
          const name = document.getElementById('name').value;
          const studentNumber = document.getElementById('studentNumber').value;
          const email = document.getElementById('email').value;

          if (!studentId) {
            alert('학생 ID를 입력하세요');
            return;
          }

          makeRequest('updateStudent', { studentId, name, studentNumber, email });
        }

        function testDeactivateStudent() {
          const studentId = document.getElementById('studentId').value;
          if (!studentId) {
            alert('학생 ID를 입력하세요');
            return;
          }
          makeRequest('deactivateStudent', { studentId });
        }

        function testRemoveStudent() {
          const studentId = document.getElementById('studentId').value;
          if (!studentId) {
            alert('학생 ID를 입력하세요');
            return;
          }
          if (confirm('정말로 학생을 삭제하시겠습니까?')) {
            makeRequest('removeStudent', { studentId });
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`
    ✅ 학생 API 서버가 실행 중입니다!

    🌐 브라우저에서 열기: http://localhost:${port}
    📡 API 엔드포인트: http://localhost:${port}/api/student

    Mock 데이터가 자동으로 활성화되었습니다.
    Ctrl+C를 눌러 서버를 종료합니다.
  `);
});
