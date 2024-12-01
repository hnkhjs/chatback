# Chat Project Backend Server

Express와 MongoDB를 사용하는 채팅 프로젝트의 백엔드 서버입니다.

## 기술 스택

- Node.js
- Express
- MongoDB (Mongoose)
- CORS
- dotenv

## 시작하기

### 사전 요구사항

- Node.js
- MongoDB

### 설치

1. 저장소 클론
```bash
git clone [저장소 URL]
cd chatpj
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 설정하세요:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatdb
```

### 실행

- 개발 모드 실행 (nodemon 사용)
```bash
npm run dev
```

- 일반 실행
```bash
npm start
```

## 프로젝트 구조

```
chatpj/
├── node_modules/
├── .env              # 환경 변수 설정
├── .gitignore       # Git 제외 파일 설정
├── package.json     # 프로젝트 의존성 및 스크립트
├── README.md        # 프로젝트 문서
└── server.js        # 메인 서버 파일
```

## 주요 기능

- Express 서버 설정
- MongoDB 데이터베이스 연결
- CORS 설정
- 기본 라우트 설정 ('/')

## API 엔드포인트

- GET `/`: 서버 상태 확인

## 개발

nodemon을 사용하여 개발 중 파일 변경 사항이 자동으로 반영됩니다.

## 라이선스

ISC
