# trAIn-frontend
React (Vite) 기반 프론트엔드 레포지토리. AI 대화 훈련 프로젝트 trAIn의 사용자 인터페이스를 담당합니다.

## 리액트 앱 실행 가이드

### 1. 새 프로젝트 생성 시

1. **Node.js 설치**
2. 프로젝트 생성

   ```bash
   npm create vite@latest 프로젝트폴더명
   ```

    * proceed → `y`
    * 프레임워크 선택: `React`
    * Variant 선택: `JavaScript`
3. 프로젝트 실행

   ```bash
   cd 프로젝트폴더명
   npm install
   npm run dev
   ```

---

### 2. 깃허브에서 클론한 프로젝트 실행 시

1. 저장소 클론

   ```bash
   git clone <레포지토리 주소>
   cd 프로젝트폴더명
   ```
2. 패키지 설치 (최초 1번만 실행)

   ```bash
   npm install
   ```
3. 프론트엔드 서버 실행 (서버 켤 때마다 실행)

   ```bash
   npm run dev
   ```

---

### 3. 서버 종료 방법

* 실행 중인 터미널에서

    * **Ctrl + C** → 즉시 종료
    * (Windows 환경에서) **Ctrl + Z** → 일시 중지
