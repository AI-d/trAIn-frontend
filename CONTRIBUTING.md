# 기여 가이드 (Contributing Guide)

**Aid 팀**의 **trAIn 프로젝트 - Dialogym**에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 워크플로우](#개발-워크플로우)
- [브랜치 전략](#브랜치-전략)
- [커밋 컨벤션](#커밋-컨벤션)
- [Pull Request 가이드](#pull-request-가이드)
- [코드 스타일](#코드-스타일)
- [테스트](#테스트)

## 행동 강령

이 프로젝트는 모든 기여자가 존중받는 환경을 유지하기 위해 노력합니다. 다음 원칙을 준수해주세요:

- 서로를 존중하고 배려합니다
- 건설적인 피드백을 제공합니다
- 다양한 관점과 경험을 환영합니다
- 프로젝트와 커뮤니티의 이익을 최우선으로 합니다

## 시작하기

### 1. 저장소 포크 및 클론

```bash
# 저장소 포크 후 클론
git clone https://github.com/YOUR_USERNAME/trAIn-frontend.git
cd trAIn-frontend

# 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/AI-d/trAIn-frontend.git
```

### 2. 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.template .env

# 개발 서버 실행
npm run dev
```

개발 서버는 `http://localhost:5050`에서 실행됩니다.

### 3. 최신 변경사항 동기화

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 개발 워크플로우

### 1. 이슈 확인 또는 생성

- 기존 이슈를 확인하거나 새로운 이슈를 생성합니다
- 이슈 생성 시 [이슈 템플릿](.github/ISSUE_TEMPLATE/)을 참고해주세요
- 작업하기 전에 이슈에 코멘트를 남겨 중복 작업을 방지합니다

### 2. 브랜치 생성

```bash
# 최신 main 브랜치에서 시작
git switch main
git pull upstream main

# 새 브랜치 생성
git switch -b feature/your-feature-name
```

### 3. 개발 및 테스트

- 코드를 작성하고 테스트합니다
- 린트 검사를 통과하는지 확인합니다

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix
```

### 4. 커밋

```bash
git add .
git commit -m "feat: 새로운 기능 추가"
```

### 5. Push 및 Pull Request

```bash
git push origin feature/your-feature-name
```

GitHub에서 Pull Request를 생성합니다.

## 브랜치 전략

### 브랜치 명명 규칙

- `feature/기능명` - 새로운 기능 개발
- `fix/버그명` - 버그 수정
- `docs/문서명` - 문서 작업
- `refactor/리팩토링명` - 코드 리팩토링
- `style/스타일명` - 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `test/테스트명` - 테스트 추가 또는 수정
- `chore/작업명` - 빌드 프로세스, 도구 설정 등

### 예시

```bash
feature/add-voice-recognition
fix/login-validation-error
docs/update-readme
refactor/simplify-auth-logic
style/format-components
test/add-feedback-tests
chore/update-dependencies
```

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

### 커밋 메시지 형식

```
<타입>(<범위>): <제목>

<본문>

<푸터>
```

### 타입

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 프로세스, 도구 설정 등
- `perf`: 성능 개선

### 예시

```bash
feat(auth): 소셜 로그인 기능 추가

Google, Kakao, Naver 소셜 로그인을 지원합니다.

Closes #123
```

```bash
fix(dialogue): WebSocket 연결 끊김 문제 해결

재연결 로직을 추가하여 네트워크 불안정 시에도
대화가 끊기지 않도록 개선했습니다.

Fixes #456
```

## Pull Request 가이드

### PR 생성

- PR 생성 시 [PR 템플릿](.github/PULL_REQUEST_TEMPLATE.md)이 자동으로 적용됩니다
- 템플릿의 모든 항목을 작성해주세요

### PR 체크리스트

PR을 생성하기 전에 다음 사항을 확인해주세요:

- [ ] 코드가 린트 검사를 통과합니다 (`npm run lint`)
- [ ] 모든 테스트가 통과합니다
- [ ] 새로운 기능에 대한 문서를 추가했습니다
- [ ] 커밋 메시지가 컨벤션을 따릅니다
- [ ] 브랜치가 최신 main과 동기화되어 있습니다

### 리뷰 프로세스

1. PR을 생성하면 자동으로 린트 및 테스트가 실행됩니다
2. 최소 1명의 리뷰어 승인이 필요합니다
3. 모든 코멘트가 해결되어야 합니다
4. CI/CD 체크가 모두 통과해야 합니다

## 코드 스타일

### JavaScript/React

- ESLint 규칙을 준수합니다
- 함수형 컴포넌트와 Hooks를 사용합니다
- PropTypes 또는 TypeScript로 타입을 정의합니다

### 컴포넌트 작성 규칙

```jsx
// 컴포넌트 파일: ComponentName.jsx
import { useState } from 'react';
import styles from './ComponentName.module.scss';

/**
 * 컴포넌트 설명
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 제목
 */
export const ComponentName = ({ title }) => {
  const [state, setState] = useState(null);

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
};
```

### SCSS 스타일

```scss
// ComponentName.module.scss
.container {
  padding: 1rem;

  h1 {
    font-size: 2rem;
    color: var(--primary-color);
  }
}
```

### 네이밍 컨벤션

- **컴포넌트**: PascalCase (예: `UserProfile.jsx`)
- **파일**: camelCase (예: `authService.js`)
- **CSS 클래스**: kebab-case (예: `.user-profile`)
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- **함수/변수**: camelCase (예: `getUserData`)

## 테스트

### 테스트 작성

```javascript
// ComponentName.test.jsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test ComponentName.test.jsx

# 커버리지 확인
npm test -- --coverage
```

## 추가 리소스

- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Zustand 문서](https://zustand-demo.pmnd.rs/)
- [프로젝트 문서](./docs/)

## 질문이나 도움이 필요하신가요?

- GitHub Issues에 질문을 올려주세요
- 이메일: dialogym.official@gmail.com

## 감사합니다

여러분의 기여가 Aid 팀의 trAIn 프로젝트 Dialogym을 더 나은 서비스로 만듭니다. 감사합니다!
