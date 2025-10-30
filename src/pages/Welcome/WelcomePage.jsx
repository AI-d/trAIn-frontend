// src/pages/Welcome/WelcomePage.jsx
import styles from './WelcomePage.module.scss';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL } from '@/services/apiClient';
import WelcomeHeader from '@/components/Welcome/WelcomeHeader';
import WelcomeHero from '@/components/Welcome/WelcomeHero';
import EmailLoginButton from '@/components/Auth/EmailLoginButton';
import SocialButtonGroup from '@/components/Auth/SocialButtonGroup';
import WelcomeFooter from '@/components/Welcome/WelcomeFooter';

const WelcomePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 소셜 로그인 콜백 처리: code 파라미터가 있으면 /callback으로 리다이렉트
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            navigate(`/callback?code=${code}`, { replace: true });
        }
    }, [searchParams, navigate]);

    // 로그인 상태 확인
    const isAuthenticated = useAuthStore((s) => s.status === 'authenticated');
    const logout = useAuthStore((s) => s.logout);

    // 회원가입 버튼 클릭
    const handleSignupClick = () => {
        navigate('/signup');
    };

    // 이메일 로그인 버튼 클릭
    const handleEmailLogin = () => {
        navigate('/login');
    };

    // 소셜 로그인
    const handleSocialLogin = (provider) => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    };

    // 로그아웃
    const handleLogout = async () => {
        await logout();
        // 페이지 새로고침으로 UI 갱신
        window.location.reload();
    };

    return (
        <div className={`${styles['welcome-page']} welcome-page`}>
            {/* 헤더 */}
            <WelcomeHeader
                onSignupClick={handleSignupClick}
                // 로그인 상태면 로그아웃 버튼
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
            />

            {/* 메인 컨텐츠 */}
            <main className={`${styles['welcome-page__main']} welcome-page__main`}>
                <WelcomeHero />

                {/* 로그인 안 되어있을 때만 로그인 액션 표시 */}
                {!isAuthenticated && (
                    <div className={`${styles['welcome-page__actions']} welcome-page__actions`}>
                        <EmailLoginButton onClick={handleEmailLogin} />

                        <div className={`${styles['welcome-page__divider']} welcome-page__divider`}>
                            <span
                                className={`${styles['welcome-page__divider-text']} welcome-page__divider-text`}>또는</span>
                        </div>

                        <SocialButtonGroup onSocialLogin={handleSocialLogin} />
                    </div>
                )}

                {/* 로그인 되어있으면 다른 UI 표시 */}
                {isAuthenticated && (
                    <div className={`${styles['welcome-page__authenticated']} welcome-page__authenticated`}>
                        <p className={`${styles['welcome-page__welcome-message']} welcome-page__welcome-message`}>
                            환영합니다! 대화 훈련을 시작해보세요.
                        </p>
                        <button
                            className={`${styles['welcome-page__start-button']} welcome-page__start-button`}
                            onClick={() => navigate('/scenarios')}
                        >
                            훈련 시작하기
                        </button>
                    </div>
                )}
            </main>

            <WelcomeFooter />
        </div>
    );
};

export default WelcomePage;