// src/pages/Auth/EmailVerificationCompletePage.jsx
import styles from './EmailVerificationCompletePage.module.scss';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLogo from '@/components/common/AuthLogo';

const EmailVerificationCompletePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(3);

    const { email } = location.state || {};

    useEffect(() => {
        // 이메일 정보가 없으면 로그인 페이지로 리디렉트
        if (!email) {
            navigate('/login', { replace: true });
            return;
        }

        // 카운트다운
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // 카운트다운 종료 후 로그인 페이지로 이동
            navigate('/login', {
                replace: true,
                state: {
                    email,
                    message: '이메일 인증이 완료되었습니다.',
                },
            });
        }
    }, [countdown, email, navigate]);

    const handleLoginNow = () => {
        navigate('/login', {
            replace: true,
            state: {
                email,
                message: '이메일 인증이 완료되었습니다.',
            },
        });
    };

    return (
        <div className={styles['verification-complete-page']}>
            <div className={styles['verification-complete-page__container']}>
                {/* 로고 */}
                <AuthLogo />

                {/* 성공 아이콘 */}
                <div className={styles['verification-complete-page__icon']}>
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="40" fill="#4CAF50" fillOpacity="0.1" />
                        <circle cx="40" cy="40" r="32" fill="#4CAF50" />
                        <path
                            d="M28 40L36 48L52 32"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* 메시지 */}
                <div className={styles['verification-complete-page__content']}>
                    <h1 className={styles['verification-complete-page__title']}>
                        이메일 인증 완료!
                    </h1>
                    <p className={styles['verification-complete-page__subtitle']}>
                        <strong>{email}</strong> 계정의<br />
                        이메일 인증이 성공적으로 완료되었습니다.
                    </p>
                    <p className={styles['verification-complete-page__info']}>
                        {countdown}초 후 로그인 페이지로 이동합니다.
                    </p>
                </div>

                {/* 버튼 */}
                <button
                    className={styles['verification-complete-page__button']}
                    onClick={handleLoginNow}
                >
                    바로 로그인하기
                </button>
            </div>
        </div>
    );
};

export default EmailVerificationCompletePage;
