// src/routes/route.config.jsx

/**
 * 라우트 설정 파일
 * 각 페이지의 경로, 컴포넌트, 인증 여부, 메타 정보(타이틀 등)를 정의합니다.
 */

import WelcomePage from '@/pages/Welcome/WelcomePage';
import SignupPage from '@/pages/Auth/SignupPage';
import EmailVerificationPage from '@/pages/Auth/EmailVerificationPage';
import LoginPage from '@/pages/Auth/LoginPage';
import CallbackPage from '@/pages/Auth/CallbackPage';
import SocialSignupCompletePage from '@/pages/Auth/SocialSignupCompletePage';
import MyProfilePage from '@/pages/User/MyProfilePage';

// 라우트 메타 정의
export const routes = [
    {
        path: '/',
        element: <WelcomePage />,
        authRequired: false,
        title: 'Welcome - Dialogym',
    },
    {
        path: '/signup',
        element: <SignupPage />,
        authRequired: false,
        title: '회원가입 - Dialogym',
    },
    {
        path: '/verify-email',
        element: <EmailVerificationPage />,
        authRequired: false,
        title: '이메일 인증 - Dialogym',
    },
    {
        path: '/login',
        element: <LoginPage />,
        authRequired: false,
        title: '로그인 - Dialogym',
    },
    {
        path: '/callback',
        element: <CallbackPage />,
        authRequired: false,
        title: '소셜 로그인 처리중 - Dialogym',
    },
    {
        path: '/social-signup',
        element: <SocialSignupCompletePage />,
        authRequired: false,
        title: '소셜 회원가입 완료 - Dialogym',
    },
    {
        path: '/profile',
        element: <MyProfilePage />,
        authRequired: true,
        title: '내 프로필 - Dialogym',
    },
];
