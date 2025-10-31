// src/pages/Auth/SocialSignupPage.jsx
import styles from './SocialSignupPage.module.scss';
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';
import SignupStep1 from '@/components/Auth/signup/SignupStep1';
import SocialSignupStep2 from '@/components/Auth/signup/SocialSignupStep2';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorMessage from '@/components/common/ErrorMessage';
import AuthLogo from '@/components/common/AuthLogo';

const SocialSignupPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const completeSocialSignup = useAuthStore((s) => s.completeSocialSignup);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // socialTempToken (백엔드가 token 파라미터로 보냄)
    const [socialTempToken, setSocialTempToken] = useState('');

    const [consents, setConsents] = useState([]);
    const [formData, setFormData] = useState({
        birthDate: '',
        jobType: '',
        jobDetail: '',
    });

    // URL에서 token 추출
    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setError('유효하지 않은 접근입니다.');
            setTimeout(() => {
                navigate('/', {replace: true});
            }, 2000);
            return;
        }

        setSocialTempToken(token);
    }, [searchParams, navigate]);

    const handleStep1Next = () => {
        setCurrentStep(2);
    };

    const handleStep2Prev = () => {
        setCurrentStep(1);
    };

    // 최종 제출
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError('');

            // payload 구성
            const payload = {
                socialSignupPendingToken: socialTempToken, // ← 이 필드명이 중요!
                birthDate: formData.birthDate,
                jobType: formData.jobType,
                jobDetail: formData.jobType === 'OTHER' ? formData.jobDetail : null,
                consents: consents.map(consent => ({
                    termsId: consent.termsId,
                    version: consent.version,
                    agreed: consent.agreed,
                })),
            };

            console.log('소셜 회원가입 payload:', payload); // ← 디버깅용

            // 소셜 회원가입 완료 API 호출
            await completeSocialSignup(payload);

            // 성공 → 시나리오 목록으로 이동
            navigate('/scenarios', {replace: true});

        } catch (err) {
            console.error('소셜 회원가입 완료 실패:', err);
            const errorData = err.response?.data;
            setError(errorData?.detail || errorData?.message || '회원가입에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 로딩 중
    if (!socialTempToken && !error) {
        return <LoadingOverlay fullscreen message="페이지를 불러오는 중..."/>;
    }

    return (
        <div className={styles['social-signup-page']}>
            <div className={styles['social-signup-page__container']}>
                {/* 로고 */}
                <AuthLogo />

                {/* 타이틀 */}
                <div className={styles['social-signup-page__header']}>
                    <h1 className={styles['social-signup-page__title']}>소셜 회원가입</h1>
                    <p className={styles['social-signup-page__subtitle']}>
                        추가 정보를 입력하고 가입을 완료하세요.
                    </p>
                </div>

                <div className={styles['social-signup-page__progress']}>
                    <div
                        className={`${styles['social-signup-page__step']} ${currentStep === 1 ? styles['active'] : ''}`}
                    >
                        <span className={styles['social-signup-page__step-number']}>1</span>
                        <span className={styles['social-signup-page__step-label']}>약관 동의</span>
                    </div>
                    <div className={styles['social-signup-page__step-divider']}/>
                    <div
                        className={`${styles['social-signup-page__step']} ${currentStep === 2 ? styles['active'] : ''}`}
                    >
                        <span className={styles['social-signup-page__step-number']}>2</span>
                        <span className={styles['social-signup-page__step-label']}>정보 입력</span>
                    </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className={styles['social-signup-page__error']}>
                        <ErrorMessage message={error} type="error"/>
                    </div>
                )}

                {/* Step 1: 약관 동의 */}
                {currentStep === 1 && (
                    <SignupStep1
                        consents={consents}
                        onConsentsChange={setConsents}
                        onNext={handleStep1Next}
                    />
                )}

                {/* Step 2: 추가 정보 입력 */}
                {currentStep === 2 && (
                    <SocialSignupStep2
                        formData={formData}
                        onFormChange={setFormData}
                        onPrev={handleStep2Prev}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            {/* 전체 화면 로딩 */}
            {isSubmitting && <LoadingOverlay fullscreen message="회원가입을 완료하는 중..."/>}
        </div>
    );
};

export default SocialSignupPage;