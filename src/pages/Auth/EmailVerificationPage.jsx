// src/pages/Auth/EmailVerificationPage.jsx

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {VerificationCodeInput} from '@/components/Auth/VerificationCodeInput';
import * as authService from '@/services/authService';

export function EmailVerificationPage() {
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState('');
    const [email, setEmail] = useState('');
    const [emailVerificationToken, setEmailVerificationToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('emailVerificationToken');
        const storedEmail = sessionStorage.getItem('signupEmail');

        if (!storedToken || !storedEmail) {
            navigate('/signup');
            return;
        }

        setEmailVerificationToken(storedToken);
        setEmail(storedEmail);
    }, [navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            setError('인증코드 6자리를 모두 입력해주세요');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.verifyEmail({
                email,
                verificationCode,
                emailVerificationToken
            });

            sessionStorage.removeItem('emailVerificationToken');
            sessionStorage.removeItem('signupEmail');

            window.history.replaceState({}, document.title, '/verify-email');

            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || '인증에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError('');

        try {
            await authService.resendVerificationEmail(email);
            setResendCooldown(60);
        } catch (err) {
            setError(err.response?.data?.message || '재발송에 실패했습니다.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCodeChange = (code) => {
        setVerificationCode(code);
        if (error) {
            setError('');
        }
    };

    if (!emailVerificationToken || !email) {
        return null;
    }

    return (
        <div className="email-verification-page">
            <header className="email-verification-page__header">
                <div className="email-verification-page__logo">
                    <span>Dialogym</span>
                </div>
            </header>

            <main className="email-verification-page__main">
                <div className="email-verification-page__container">
                    <div className="email-verification-page__content">
                        <h1 className="email-verification-page__title">이메일 인증</h1>
                        <p className="email-verification-page__subtitle">
                            <strong>{email}</strong>로 발송된<br/>
                            인증코드 6자리를 입력해주세요
                        </p>

                        <div className="email-verification-page__input-section">
                            <VerificationCodeInput
                                value={verificationCode}
                                onChange={handleCodeChange}
                                disabled={loading}
                                error={error}
                            />
                        </div>

                        <button
                            className={`email-verification-page__verify-btn ${loading ? 'email-verification-page__verify-btn--loading' : ''}`}
                            onClick={handleVerify}
                            disabled={loading || verificationCode.length !== 6}
                        >
                            {loading ? (
                                <div className="email-verification-page__spinner"/>
                            ) : (
                                '인증하기'
                            )}
                        </button>

                        <div className="email-verification-page__resend-section">
                            <p className="email-verification-page__resend-text">
                                인증코드를 받지 못하셨나요?
                            </p>
                            <button
                                className="email-verification-page__resend-btn"
                                onClick={handleResend}
                                disabled={resendLoading || resendCooldown > 0}
                            >
                                {resendLoading ? (
                                    '발송 중...'
                                ) : resendCooldown > 0 ? (
                                    `재발송 (${resendCooldown}초 후)`
                                ) : (
                                    '인증코드 재발송'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
