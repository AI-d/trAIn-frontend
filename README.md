# trAIn Frontend

> AI 기반 대화 훈련 플랫폼 Dialogym의 프론트엔드 애플리케이션

Aid 팀의 trAIn 프로젝트 중 Dialogym 서비스의 프론트엔드입니다. 다양한 시나리오에서 AI와 실시간 대화를 나누고 즉각적인 피드백을 받아 커뮤니케이션 능력을 향상시킬 수 있습니다.

## 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 9.x 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/AI-d/trAIn-frontend.git
cd trAIn-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.template .env
# .env 파일을 열어 필요한 값 설정

# 개발 서버 실행 (http://localhost:5050)
npm run dev
```

### 환경 변수

`.env` 파일에 다음 값을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:9090
VITE_WS_URL=ws://localhost:9090/ws
VITE_USE_DYNAMIC_HOST=true
```



## 디렉토리 구조

```
src/
├── assets/              # 정적 리소스 (이미지, 폰트)
├── components/          # 재사용 가능한 컴포넌트
│   ├── Auth/           # 인증 관련 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Input, Modal, Button 등)
│   ├── Dialogue/       # 대화 관련 컴포넌트
│   ├── Feedback/       # 피드백 관련 컴포넌트
│   ├── Header/         # 헤더 컴포넌트
│   ├── Scenario/       # 시나리오 관련 컴포넌트
│   ├── User/           # 사용자 관련 컴포넌트
│   └── Welcome/        # 웰컴 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── layouts/            # 레이아웃 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── Auth/          # 인증 페이지 (로그인, 회원가입)
│   ├── Dialogue/      # 대화 진행 페이지
│   ├── Feedback/      # 피드백 페이지
│   ├── Scenario/      # 시나리오 목록/생성 페이지
│   ├── User/          # 사용자 프로필 페이지
│   └── Welcome/       # 랜딩 페이지
├── routes/             # 라우팅 설정
├── services/           # API 서비스
├── stores/             # 상태 관리 (Zustand)
├── utils/              # 유틸리티 함수
├── App.jsx             # 루트 컴포넌트
└── main.jsx            # 엔트리 포인트
```

## 주요 기능

### 인증
- 이메일/비밀번호 로그인 및 회원가입
- 소셜 로그인 (Google, Kakao, Naver)
- 이메일 인증
- JWT 토큰 관리 (Access Token + Refresh Token)

### 시나리오
- 시나리오 목록 조회 및 검색
- 커스텀 시나리오 생성

### 대화
- AI와의 실시간 대화 (WebSocket)
- 타이핑 인디케이터
- 대화 히스토리 관리

### 피드백
- AI 기반 대화 피드백 생성
- 문법, 어휘, 유창성 등 세부 평가
- 개선 제안 및 대안 표현 제공

### 프로필
- 사용자 정보 관리
- 비밀번호 변경
- 피드백 히스토리 조회

## 기술 스택

### Core
- React 19.1.1 - UI 라이브러리
- Vite 7.1.11 - 빌드 도구 및 개발 서버
- React Router DOM 7.9.4 - 클라이언트 사이드 라우팅

### 상태 관리
- Zustand 5.0.8 - 경량 전역 상태 관리
- Immer 10.2.0 - 불변성 관리
- zustand-persist 0.4.0 - 상태 영속화

### 스타일링
- SASS 1.92.1 - CSS 전처리기
- SCSS Modules - 컴포넌트 스코프 스타일링

### HTTP & AI
- Axios 1.12.2 - HTTP 클라이언트
- OpenAI 4.104.0 - OpenAI API 통합

### 음성 인식
- @ricky0123/vad-react 0.0.34 - React용 음성 활동 감지
- @ricky0123/vad-web 0.0.28 - 웹 기반 음성 활동 감지

### UI 컴포넌트 & 라이브러리
- Ant Design 5.27.4 - UI 컴포넌트 라이브러리
- React Icons 5.5.0 - 아이콘 라이브러리
- React Hot Toast 2.6.0 - 토스트 알림
- React Markdown 10.1.0 - 마크다운 렌더링

### 개발 도구
- ESLint 9.33.0 - 코드 린팅
- Storybook 9.1.15 - 컴포넌트 개발 환경
- Vitest 4.0.3 - 단위 테스트 프레임워크
- Playwright 1.56.1 - E2E 테스트

## 스크립트

```bash
npm run dev          # 개발 서버 실행 (포트 5050)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # 린트 검사
npm run storybook    # Storybook 실행 (포트 6006)
```

## 개발 가이드

### 코드 스타일
- ESLint 규칙 준수
- SCSS Modules 사용
- 컴포넌트: PascalCase, 파일: camelCase

### 컴포넌트 예시
```jsx
import styles from './ComponentName.module.scss';

export const ComponentName = ({ prop1, prop2 }) => {
  return <div className={styles.container}>{/* 내용 */}</div>;
};
```

### 상태 관리 예시
```javascript
import { useAuthStore } from '@/stores/authStore';

const { user, login, logout } = useAuthStore();
```

## 라이선스

Copyright (c) 2025 Aid Team. All Rights Reserved.

이 프로젝트는 독점 소프트웨어입니다. 무단 사용, 복제, 수정 및 배포는 금지됩니다.

## 팀

Aid Team
- 왕택준
- 김경민
- 진도희

## 문의

- Email: dialogym.official@gmail.com
- Issues: GitHub Issues
