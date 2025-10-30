// src/pages/Auth/CallbackPage.jsx
import styles from './CallbackPage.module.scss';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import CallbackStatus from '@/components/Auth/callback/CallbackStatus';

/**
 * 소셜 로그인 콜백 페이지
 *
 * 플로우:
 * 1. URL에서 code 추출
 * 2. authStore.exchangeCode(code) 호출
 * 3. 성공 → 기존 회원 → / (홈) 이동
 * 4. 실패 (USER_NOT_FOUND) → 신규 회원 → /social-signup-complete?token=xxx 이동
 */
const CallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const exchangeCode = useAuthStore((s) => s.exchangeCode);

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');

            if (!code) {
                setStatus('error');
                setMessage('인증 코드가 없습니다.');
                return;
            }

            try {
                setStatus('loading');
                setMessage('로그인 정보를 확인하는 중...');

                await exchangeCode(code);

                setStatus('success');
                setMessage('로그인 성공! 홈으로 이동합니다.');

                setTimeout(() => {
                    navigate('/home', { replace: true }); // ← 홈으로 이동
                }, 1500);

            } catch (error) {
                console.error('소셜 로그인 콜백 실패:', error);

                const errorData = error.response?.data;
                const errorCode = errorData?.error || errorData?.errorCode;

                if (errorCode === 'USER_NOT_FOUND') {
                    const socialTempToken = errorData?.data?.socialTempToken;

                    if (socialTempToken) {
                        setMessage('추가 정보 입력이 필요합니다...');
                        setTimeout(() => {
                            navigate(`/social-signup?token=${socialTempToken}`, { replace: true });
                        }, 1000);
                    } else {
                        setStatus('error');
                        setMessage('회원가입 정보를 불러올 수 없습니다.');
                    }
                } else {
                    setStatus('error');
                    setMessage(errorData?.detail || errorData?.message || '로그인 처리 중 오류가 발생했습니다.');
                }
            }
        };

        handleCallback();
    }, [searchParams, exchangeCode, navigate]);

    return (
        <div className={styles['callback-page']}>
            <div className={styles['callback-page__container']}>
                <CallbackStatus status={status} message={message} />
            </div>
        </div>
    );
};

export default CallbackPage;