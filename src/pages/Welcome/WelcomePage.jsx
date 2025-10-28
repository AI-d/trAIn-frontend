// src/pages/Welcome/WelcomePage.jsx
// import styles from './WelcomePage.module.scss';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from '@/components/Welcome/WelcomeHeader';
import WelcomeHero from '@/components/Welcome/WelcomeHero';
import EmailLoginButton from '@/components/Auth/EmailLoginButton';
import SocialButtonGroup from '@/components/Auth/SocialButtonGroup';
import WelcomeFooter from '@/components/Welcome/WelcomeFooter';

/**
 * 웰컴 페이지 (첫 진입 페이지)
 * 로그인/회원가입 선택 화면
 */
const WelcomePage = () => {
    const navigate = useNavigate();

    // 회원가입 버튼 클릭
    const handleSignupClick = () => {
        navigate('/signup');
    };

    // 이메일 로그인 버튼 클릭
    const handleEmailLogin = () => {
        navigate('/login');
    };

    // 소셜 로그인 (provider: 'google' | 'kakao' | 'naver')
    const handleSocialLogin = (provider) => {
        // OAuth2 엔드포인트로 리디렉트
        window.location.href = `/oauth2/authorization/${provider}`;
    };

    return (
        <div className="welcome-page">
            {/* 헤더 */}
            <WelcomeHeader onSignupClick={handleSignupClick} />

            {/* 메인 컨텐츠 */}
            <main className="welcome-page__main">
                {/* 히어로 섹션 */}
                <WelcomeHero />

                {/* 로그인 액션 */}
                <div className="welcome-page__actions">
                    {/* 이메일 로그인 버튼 */}
                    <EmailLoginButton onClick={handleEmailLogin} />

                    {/* 구분선 */}
                    <div className="welcome-page__divider">
                        <span className="welcome-page__divider-text">또는</span>
                    </div>

                    {/* 소셜 로그인 버튼 그룹 */}
                    <SocialButtonGroup onSocialLogin={handleSocialLogin} />
                </div>
            </main>

            {/* 푸터 */}
            <WelcomeFooter />
        </div>
    );
};

export default WelcomePage;