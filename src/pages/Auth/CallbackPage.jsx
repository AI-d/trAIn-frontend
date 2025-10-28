// src/pages/Auth/CallbackPage.jsx

import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';

export function CallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {exchangeCode} = useAuthStore();
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            setStatus('error');
            setError('인증 코드가 없습니다.');
            return;
        }

        const handleTokenExchange = async () => {
            try {
                await exchangeCode(code);

                window.history.replaceState({}, document.title, window.location.pathname);

                navigate('/');
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.');
            }
        };

        handleTokenExchange();
    }, [searchParams, exchangeCode, navigate]);

    const handleRetryClick = () => {
        navigate('/login');
    };

    if (status === 'loading') {
        return (
            <div className="callback-page">
                <div className="callback-page__container">
                    <div className="callback-page__spinner"/>
                    <p className="callback-page__message">로그인 처리 중...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="callback-page">
                <div className="callback-page__container">
                    <div className="callback-page__error-icon">⚠️</div>
                    <h2 className="callback-page__error-title">로그인 실패</h2>
                    <p className="callback-page__error-message">{error}</p>
                    <button
                        className="callback-page__retry-btn"
                        onClick={handleRetryClick}
                        type="button"
                    >
                        다시 로그인하기
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
