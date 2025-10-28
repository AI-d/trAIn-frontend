// src/pages/Auth/LoginPage.jsx

import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';
import {LoginForm} from '.@/components/Auth/LoginForm';
import {SocialButtonGroup} from '@/components/Auth/SocialButtonGroup';

export function LoginPage() {
    const navigate = useNavigate();
    const {login} = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (credentials) => {
        setLoading(true);
        setError('');

        try {
            await login(credentials);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupClick = () => {
        navigate('/signup');
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `/oauth2/authorization/${provider}`;
    };

    return (
        <div className="login-page">
            <header className="login-page__header">
                <div className="login-page__logo">
                    <span className="login-page__logo-text">Dialogym</span>
                </div>
                <button
                    className="login-page__signup-btn"
                    onClick={handleSignupClick}
                    type="button"
                >
                    회원가입
                </button>
            </header>

            <main className="login-page__main">
                <div className="login-page__container">
                    <h1 className="login-page__title">로그인</h1>

                    <LoginForm
                        onSubmit={handleLogin}
                        loading={loading}
                        error={error}
                    />

                    <div className="login-page__divider">
                        <span>또는</span>
                    </div>

                    <SocialButtonGroup onSocialLogin={handleSocialLogin}/>
                </div>
            </main>
        </div>
    );
}
