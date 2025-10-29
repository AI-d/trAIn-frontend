// src/pages/Auth/EmailVerificationPage.jsx
// import styles from './EmailVerificationPage.module.scss';
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import * as authService from '@/services/authService';
import VerificationCodeInput from '@/components/Auth/VerificationCodeInput';
import ErrorMessage from '@/components/common/ErrorMessage';
import {getErrorMessage, validateVerificationCode} from '@/utils/validation';

const EmailVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {email, emailVerificationToken: initialToken} = location.state || {};

    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // 토큰을 state로 관리 (재전송 시 업데이트)
    const [emailVerificationToken, setEmailVerificationToken] = useState(initialToken);

    // 이메일 또는 토큰 없으면 회원가입 페이지로 리디렉트
    useEffect(() => {
        if (!email || !emailVerificationToken) {
            navigate('/signup', {replace: true});
        }
    }, [email, emailVerificationToken, navigate]);

    // 재전송 쿨다운 타이머
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // 인증 코드 변경
    const handleCodeChange = (code) => {
        setVerificationCode(code);
        setError('');
    };

    // 인증 제출
    const handleSubmit = async () => {
        // 검증
        if (!validateVerificationCode(verificationCode)) {
            setError(getErrorMessage.verificationCode(verificationCode));
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            const payload = {
                email,
                verificationCode,
                emailVerificationToken, // state에서 가져온 토큰 사용
            };

            await authService.verifyEmail(payload);

            // 성공 → 로그인 페이지로 이동
            navigate('/login', {
                replace: true,
                state: {
                    message: '이메일 인증이 완료되었습니다. 로그인해주세요.',
                },
            });

        } catch (err) {
            console.error('이메일 인증 실패:', err);
            const errorData = err.response?.data;
            const errorCode = errorData?.error || errorData?.errorCode;

            if (errorCode === 'VERIFY_003') {
                setError('인증 코드가 올바르지 않습니다.');
            } else if (errorCode === 'VERIFY_002') {
                setError('인증 세션이 만료되었습니다. 다시 회원가입해주세요.');
                setTimeout(() => {
                    navigate('/signup', {replace: true});
                }, 2000);
            } else {
                setError(errorData?.detail || errorData?.message || '이메일 인증에 실패했습니다.');
            }

            setVerificationCode('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 인증 코드 재전송
    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            setError('');

            // 새 토큰 받기
            const response = await authService.resendVerificationEmail(email);

            // 새 토큰으로 업데이트
            if (response.emailVerificationToken) {
                setEmailVerificationToken(response.emailVerificationToken);
                console.log('새 인증 토큰 받음:', response.emailVerificationToken.substring(0, 20) + '...');
            }

            alert('인증 코드가 재발송되었습니다.');
            setResendCooldown(60);

        } catch (err) {
            console.error('재전송 실패:', err);
            const errorData = err.response?.data;
            setError(errorData?.detail || errorData?.message || '인증 코드 재전송에 실패했습니다.');
        }
    };

    return (
        <div className="email-verification-page">
            <div className="email-verification-page__container">
                {/* 타이틀 */}
                <div className="email-verification-page__header">
                    <h1 className="email-verification-page__title">이메일 인증</h1>
                    <p className="email-verification-page__subtitle">
                        <strong>{email}</strong>로 전송된<br/>
                        6자리 인증 코드를 입력해주세요.
                    </p>
                </div>

                {/* 인증 코드 입력 */}
                <div className="email-verification-page__input">
                    <VerificationCodeInput
                        value={verificationCode}
                        onChange={handleCodeChange}
                        disabled={isSubmitting}
                        error={error}
                    />
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="email-verification-page__error">
                        <ErrorMessage message={error} type="error"/>
                    </div>
                )}

                {/* 안내 메시지 */}
                <div className="email-verification-page__info">
                    <p>이메일이 오지 않았나요?</p>
                    <button
                        className="email-verification-page__resend-button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isSubmitting}
                    >
                        {resendCooldown > 0
                            ? `재전송 (${resendCooldown}초 후)`
                            : '인증 코드 재전송'}
                    </button>
                </div>

                {/* 인증 버튼 */}
                <button
                    className="email-verification-page__submit-button"
                    onClick={handleSubmit}
                    disabled={verificationCode.length !== 6 || isSubmitting}
                >
                    {isSubmitting ? '인증 중...' : '인증하기'}
                </button>
            </div>
        </div>
    );
};

export default EmailVerificationPage;